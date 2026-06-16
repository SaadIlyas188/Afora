import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendOrder, trackOrder, isConfigured } from '@/lib/barqraftar';

export async function POST(request: Request) {
  try {
    const { order, items } = await request.json();

    if (!order || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError || !createdOrder) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const orderItems = items.map((item: {
      product_id: string | null;
      bundle_id: string | null;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }) => ({ ...item, order_id: createdOrder.id }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      // Order was created, clean up
      await supabase.from('orders').delete().eq('id', createdOrder.id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Auto-send to BarqRaftar (non-blocking — order succeeds even if courier fails)
    if (isConfigured()) {
      try {
        const brResult = await sendOrder({
          referenceId: createdOrder.order_number,
          customerName: `${createdOrder.first_name} ${createdOrder.last_name}`,
          customerAddress: `${createdOrder.address}, ${createdOrder.city} ${createdOrder.postal_code}`,
          customerContact: createdOrder.phone,
          customerEmail: createdOrder.email,
          codAmount: createdOrder.total,
          totalAmount: createdOrder.total,
          toCityName: createdOrder.city,
          lineItems: items.map((item: { product_name: string; quantity: number }) => ({
            name: item.product_name,
            quantity: item.quantity,
          })),
        });

        if (brResult.success && brResult.trackingNumber) {
          // Fetch the BarqRaftar order to get its internal numeric ID
          let brOrderId: number | null = null;
          const trackResult = await trackOrder(brResult.trackingNumber);
          if (trackResult.success && trackResult.order?.id) {
            brOrderId = trackResult.order.id as number;
          }

          await supabase
            .from('orders')
            .update({
              barqraftar_tracking_number: brResult.trackingNumber,
              barqraftar_status: 'pending',
              barqraftar_order_id: brOrderId,
            })
            .eq('id', createdOrder.id);

          createdOrder.barqraftar_tracking_number = brResult.trackingNumber;
          createdOrder.barqraftar_status = 'pending';
          createdOrder.barqraftar_order_id = brOrderId;
        } else {
          console.warn('BarqRaftar order send failed:', brResult.message);
        }
      } catch (brErr) {
        console.error('BarqRaftar auto-send error (non-blocking):', brErr);
      }
    }

    return NextResponse.json({ order: createdOrder });
  } catch (err) {
    console.error('Place order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
