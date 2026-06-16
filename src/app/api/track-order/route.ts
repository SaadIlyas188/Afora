import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// UUID format check
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('order_number');
  if (!raw) {
    return NextResponse.json({ error: 'order_number is required' }, { status: 400 });
  }

  const query = raw.trim();

  // Search by UUID (order id) or by order_number
  let result;
  if (UUID_REGEX.test(query)) {
    result = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', query)
      .single();
  } else {
    result = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('order_number', query.toUpperCase())
      .single();
  }

  const { data, error } = result;

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
    barqraftar_tracking_number: data.barqraftar_tracking_number || null,
    barqraftar_status: data.barqraftar_status || null,
    items: data.items,
  };

  return NextResponse.json({ order: safeOrder });
}
