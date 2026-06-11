import { NextRequest, NextResponse } from 'next/server';
import { trackOrder, isConfigured } from '@/lib/barqraftar';

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'BarqRaftar API not configured' }, { status: 503 });
  }

  const trackingNumber = req.nextUrl.searchParams.get('tracking_number');
  if (!trackingNumber) {
    return NextResponse.json({ error: 'tracking_number is required' }, { status: 400 });
  }

  const result = await trackOrder(trackingNumber);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    status: result.brStatus,
    status_label: result.brStatusLabel,
    mapped_status: result.mappedStatus,
  });
}
