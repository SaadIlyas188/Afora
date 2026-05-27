import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get('order_number');
  if (!orderNumber) {
    return NextResponse.json({ error: 'order_number is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', orderNumber.trim().toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Return only safe fields (no user_id, no internal data)
  const safeOrder = {
    id: data.id,
    order_number: data.order_number,
    status: data.status,
    created_at: data.created_at,
    total: data.total,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    address: data.address,
    city: data.city,
    postal_code: data.postal_code,
    notes: data.notes,
    items: data.items,
  };

  return NextResponse.json({ order: safeOrder });
}
