// Server-only: send internal order notification emails via Resend
// Requires RESEND_API_KEY env var

const COMPANY_EMAIL = 'afora.skincare@outlook.com';
const RESEND_API = 'https://api.resend.com/emails';

interface OrderNotifyParams {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  postal_code: string;
  subtotal: number;
  delivery_charges: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  barqraftar_tracking_number?: string | null;
  items: { product_name: string; quantity: number; unit_price: number; total_price: number }[];
}

export async function sendOrderNotificationToCompany(params: OrderNotifyParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping company order notification');
    return;
  }

  const itemRows = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6cc;">${item.product_name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6cc;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6cc;text-align:right;">Rs. ${item.unit_price.toLocaleString()}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6cc;text-align:right;font-weight:600;">Rs. ${item.total_price.toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#faf8f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2c2c2c;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border:1px solid #e8d5a3;">

    <div style="background:#2c2c2c;padding:24px 32px;">
      <p style="margin:0;color:#d4af37;font-size:11px;letter-spacing:4px;text-transform:uppercase;">New Order</p>
      <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:300;letter-spacing:1px;">AFORA</h1>
    </div>

    <div style="padding:28px 32px;border-bottom:1px solid #f0e6cc;">
      <table style="width:100%;">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Order Number</p>
            <p style="margin:0;font-size:16px;font-family:monospace;font-weight:600;color:#2c2c2c;">${params.order_number}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Order Total</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#d4af37;">Rs. ${params.total.toLocaleString()}</p>
          </td>
        </tr>
      </table>
    </div>

    <div style="padding:24px 32px;border-bottom:1px solid #f0e6cc;">
      <p style="margin:0 0 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Customer</p>
      <table style="width:100%;font-size:14px;">
        <tr><td style="padding:4px 0;color:#999;width:120px;">Name</td><td style="padding:4px 0;font-weight:500;">${params.customer_name}</td></tr>
        <tr><td style="padding:4px 0;color:#999;">Email</td><td style="padding:4px 0;">${params.customer_email}</td></tr>
        <tr><td style="padding:4px 0;color:#999;">Phone</td><td style="padding:4px 0;">${params.customer_phone}</td></tr>
        <tr><td style="padding:4px 0;color:#999;">Address</td><td style="padding:4px 0;">${params.address}, ${params.city} ${params.postal_code}</td></tr>
        ${params.notes ? `<tr><td style="padding:4px 0;color:#999;vertical-align:top;">Notes</td><td style="padding:4px 0;color:#666;">${params.notes}</td></tr>` : ''}
      </table>
    </div>

    ${params.barqraftar_tracking_number ? `
    <div style="padding:16px 32px;border-bottom:1px solid #f0e6cc;background:#f0f4ff;">
      <p style="margin:0 0 4px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;">BarqRaftar Tracking</p>
      <p style="margin:0;font-size:15px;font-family:monospace;font-weight:600;color:#4f5fd5;">${params.barqraftar_tracking_number}</p>
    </div>` : ''}

    <div style="padding:24px 32px;border-bottom:1px solid #f0e6cc;">
      <p style="margin:0 0 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Items Ordered</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f7f0e3;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Price</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div style="padding:20px 32px 28px;font-size:14px;">
      <table style="width:100%;max-width:280px;margin-left:auto;">
        <tr><td style="padding:4px 0;color:#999;">Subtotal</td><td style="padding:4px 0;text-align:right;">Rs. ${params.subtotal.toLocaleString()}</td></tr>
        ${params.discount_amount > 0 ? `<tr><td style="padding:4px 0;color:#22c55e;">Discount</td><td style="padding:4px 0;text-align:right;color:#22c55e;">- Rs. ${params.discount_amount.toLocaleString()}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#999;">Delivery</td><td style="padding:4px 0;text-align:right;">${params.delivery_charges === 0 ? 'Free' : `Rs. ${params.delivery_charges.toLocaleString()}`}</td></tr>
        <tr style="border-top:1px solid #f0e6cc;">
          <td style="padding:10px 0 4px;font-weight:700;font-size:15px;">Total</td>
          <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:15px;color:#d4af37;">Rs. ${params.total.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="padding:16px 32px;background:#faf8f3;border-top:1px solid #f0e6cc;">
      <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">Payment method: Cash on Delivery &nbsp;·&nbsp; AFORA by Sidra Shahzad</p>
    </div>

  </div>
</body>
</html>`;

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AFORA Orders <onboarding@resend.dev>',
        to: COMPANY_EMAIL,
        subject: `New Order ${params.order_number} — Rs. ${params.total.toLocaleString()} — ${params.customer_name}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend company notification failed:', err);
    }
  } catch (err) {
    console.error('Resend company notification error:', err);
  }
}
