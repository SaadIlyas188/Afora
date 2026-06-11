import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrder, isConfigured } from '@/lib/barqraftar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'BarqRaftar API not configured' }, { status: 503 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.barqraftar_tracking_number) {
      return NextResponse.json({
        error: 'Order already sent to BarqRaftar',
        tracking_number: order.barqraftar_tracking_number,
      }, { status: 409 });
    }

    const result = await sendOrder({
      referenceId: order.order_number,
      customerName: `${order.first_name} ${order.last_name}`,
      customerAddress: `${order.address}, ${order.city} ${order.postal_code}`,
      customerContact: order.phone,
      customerEmail: order.email,
      codAmount: order.total,
      totalAmount: order.total,
      toCityName: order.city,
      lineItems: (order.items || []).map((item: { product_name: string; quantity: number }) => ({
        name: item.product_name,
        quantity: item.quantity,
      })),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Failed to send' }, { status: 500 });
    }

    await supabase
      .from('orders')
      .update({
        barqraftar_tracking_number: result.trackingNumber,
        barqraftar_status: 'pending',
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      tracking_number: result.trackingNumber,
    });
  } catch (err) {
    console.error('BarqRaftar send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
