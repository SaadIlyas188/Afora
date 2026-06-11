import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    return NextResponse.json({ order: createdOrder });
  } catch (err) {
    console.error('Place order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
