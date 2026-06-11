// Server-only BarqRaftar courier API client
// Env vars: BARQRAFTAR_API_KEY, BARQRAFTAR_API_SECRET, BARQRAFTAR_FROM_CITY_ID, BARQRAFTAR_PICKUP_ADDRESS_ID

const API_BASE = 'https://barqraftar.pk/public/api/v1';

function getHeaders(): Record<string, string> {
  return {
    key: process.env.BARQRAFTAR_API_KEY || '',
    secret: process.env.BARQRAFTAR_API_SECRET || '',
    'Content-Type': 'application/json',
  };
}

export function isConfigured(): boolean {
  return !!(process.env.BARQRAFTAR_API_KEY && process.env.BARQRAFTAR_API_SECRET);
}

// Static city name → BarqRaftar city ID map (from their /cities API)
const CITY_MAP: Record<string, number> = {
  lahore: 1,
  karachi: 2,
  islamabad: 3,
  rawalpindi: 4,
  faisalabad: 5,
  peshawar: 6,
  quetta: 7,
  multan: 8,
  hyderabad: 9,
  gujranwala: 10,
  sialkot: 11,
  bahawalpur: 12,
  sargodha: 13,
  abbottabad: 14,
  mardan: 15,
  sukkur: 16,
  sahiwal: 17,
  sheikhupura: 18,
  larkana: 19,
  jhang: 20,
  gujrat: 21,
  kasur: 22,
  'dera ghazi khan': 23,
  muzaffargarh: 24,
  okara: 25,
  'mirpur khas': 26,
  chiniot: 27,
  nawabshah: 28,
  mingora: 29,
  kamoke: 30,
};

export function getCityId(cityName: string): number {
  return CITY_MAP[cityName.toLowerCase().trim()] || 1; // default Lahore
}

// BarqRaftar status code/key → Afora status mapping
const STATUS_MAP: Record<string, string> = {
  // By key (string)
  pending: 'pending',
  awaiting_pickup: 'processing',
  picked_up: 'shipped',
  dispatched: 'shipped',
  return_by_consignee: 'shipped',
  re_attempt_requested: 'shipped',
  hold_requested: 'shipped',
  return_requested: 'shipped',
  delivered: 'delivered',
  return_transit: 'cancelled',
  return_in_progress: 'cancelled',
  return_confirmation: 'cancelled',
  return_rfc_origin: 'cancelled',
  re_attempt_approval: 'shipped',
  rfc_origin: 'shipped',
  in_transit: 'shipped',
  received_at_fc: 'shipped',
  returned_to_shipper: 'cancelled',
  cancelled: 'cancelled',
  // By numeric ID (as string)
  '1': 'pending',
  '2': 'processing',
  '3': 'shipped',
  '4': 'shipped',
  '5': 'shipped',
  '6': 'shipped',
  '7': 'shipped',
  '8': 'shipped',
  '9': 'delivered',
  '10': 'cancelled',
  '11': 'cancelled',
  '12': 'cancelled',
  '13': 'cancelled',
  '14': 'shipped',
  '30': 'shipped',
  '31': 'shipped',
  '32': 'shipped',
  '98': 'cancelled',
  '99': 'cancelled',
};

// Human-readable BarqRaftar status labels
const STATUS_LABELS: Record<string, string> = {
  '1': 'Pending', pending: 'Pending',
  '2': 'Awaiting Pickup', awaiting_pickup: 'Awaiting Pickup',
  '3': 'Picked Up', picked_up: 'Picked Up',
  '4': 'Dispatched', dispatched: 'Dispatched',
  '5': 'Return by Consignee', return_by_consignee: 'Return by Consignee',
  '6': 'Re-Attempt Requested', re_attempt_requested: 'Re-Attempt Requested',
  '7': 'Hold Requested', hold_requested: 'Hold Requested',
  '8': 'Return Requested', return_requested: 'Return Requested',
  '9': 'Delivered', delivered: 'Delivered',
  '10': 'Return Transit', return_transit: 'Return Transit',
  '11': 'Return In Progress', return_in_progress: 'Return In Progress',
  '12': 'Return Confirmation', return_confirmation: 'Return Confirmation',
  '13': 'RFC Origin (Return)', return_rfc_origin: 'RFC Origin (Return)',
  '14': 'Re-attempt Approval', re_attempt_approval: 'Re-attempt Approval',
  '30': 'RFC Origin', rfc_origin: 'RFC Origin',
  '31': 'In Transit', in_transit: 'In Transit',
  '32': 'Received at FC', received_at_fc: 'Received at FC',
  '98': 'Returned to Shipper', returned_to_shipper: 'Returned to Shipper',
  '99': 'Cancelled', cancelled: 'Cancelled',
};

export function mapBarqRaftarStatus(brStatus: string): string {
  return STATUS_MAP[brStatus] || STATUS_MAP[brStatus.toLowerCase()] || 'pending';
}

export function getBarqRaftarStatusLabel(brStatus: string): string {
  return STATUS_LABELS[brStatus] || STATUS_LABELS[brStatus.toLowerCase()] || brStatus;
}

interface SendOrderParams {
  referenceId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerEmail: string;
  codAmount: number;
  totalAmount: number;
  toCityName: string;
  lineItems: { name: string; quantity: number }[];
}

interface SendOrderResult {
  success: boolean;
  trackingNumber?: string;
  message?: string;
}

export async function sendOrder(params: SendOrderParams): Promise<SendOrderResult> {
  if (!isConfigured()) {
    console.warn('BarqRaftar API not configured, skipping order send');
    return { success: false, message: 'API not configured' };
  }

  const fromCityId = parseInt(process.env.BARQRAFTAR_FROM_CITY_ID || '1', 10);
  const toCityId = getCityId(params.toCityName);
  const pickupAddressId = process.env.BARQRAFTAR_PICKUP_ADDRESS_ID
    ? parseInt(process.env.BARQRAFTAR_PICKUP_ADDRESS_ID, 10)
    : undefined;

  const payload: Record<string, unknown> = {
    total_orders: 1,
    orders: [
      {
        reference_id: params.referenceId,
        customer_name: params.customerName,
        customer_address: params.customerAddress,
        customer_contact: params.customerContact,
        customer_email: params.customerEmail,
        total_amount: params.totalAmount,
        cod_amount: params.codAmount,
        to_city_id: toCityId,
        from_city_id: fromCityId,
        shipment_type: 'cod',
        weight_grams: 500,
        line_items: params.lineItems,
      },
    ],
  };

  if (pickupAddressId) {
    payload.create_pickup_request = 'true';
    payload.pickup_address_id = pickupAddressId;
  }

  try {
    const res = await fetch(`${API_BASE}/orders/bulk_store`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.orders_result?.[0]?.success) {
      return {
        success: true,
        trackingNumber: data.orders_result[0].tracking_number,
      };
    }

    return {
      success: false,
      message: data.orders_result?.[0]?.message || 'Failed to send order',
    };
  } catch (err) {
    console.error('BarqRaftar sendOrder error:', err);
    return { success: false, message: 'Network error' };
  }
}

interface TrackResult {
  success: boolean;
  brStatus?: string;
  brStatusLabel?: string;
  mappedStatus?: string;
  order?: Record<string, unknown>;
  message?: string;
}

export async function trackOrder(trackingNumber: string): Promise<TrackResult> {
  if (!isConfigured()) {
    return { success: false, message: 'API not configured' };
  }

  try {
    const res = await fetch(
      `${API_BASE}/order/?tracking_number=${encodeURIComponent(trackingNumber)}`,
      { headers: getHeaders() }
    );

    const data = await res.json();

    if (data.status === 'success' && data.order) {
      const brStatus = String(data.order.status);
      return {
        success: true,
        brStatus,
        brStatusLabel: getBarqRaftarStatusLabel(brStatus),
        mappedStatus: mapBarqRaftarStatus(brStatus),
        order: data.order,
      };
    }

    return { success: false, message: 'Order not found on BarqRaftar' };
  } catch (err) {
    console.error('BarqRaftar trackOrder error:', err);
    return { success: false, message: 'Network error' };
  }
}
