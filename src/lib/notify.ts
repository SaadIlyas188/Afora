// Server-only: send emails via Resend
// Requires RESEND_API_KEY env var

const COMPANY_EMAIL = 'afora.skincare@outlook.com';
const RESEND_API = 'https://api.resend.com/emails';

// ─── Customer Order Confirmation ────────────────────────────────────────────

interface CustomerOrderParams {
  customer_email: string;
  customer_name: string;
  order_number: string;
  order_date: string;
  items: { product_name: string; quantity: number; unit_price: number; total_price: number }[];
  subtotal: number;
  delivery_charges: number;
  discount_amount: number;
  total: number;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  notes?: string | null;
}

export async function sendOrderConfirmationToCustomer(params: CustomerOrderParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping customer order confirmation');
    return;
  }

  const itemRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f3ede0;font-size:14px;color:#2c2c2c;line-height:1.4;">
          <span style="font-weight:500;">${item.product_name}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f3ede0;text-align:center;font-size:14px;color:#777;">
          ${item.quantity}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f3ede0;text-align:right;font-size:14px;color:#777;">
          Rs.&nbsp;${item.unit_price.toLocaleString()}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f3ede0;text-align:right;font-size:14px;font-weight:600;color:#2c2c2c;">
          Rs.&nbsp;${item.total_price.toLocaleString()}
        </td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed — AFORA</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Lato:wght@300;400;500&display=swap');
    body{margin:0;padding:0;background:#f7f3ec;font-family:'Lato',Helvetica,Arial,sans-serif;color:#2c2c2c;-webkit-text-size-adjust:100%;}
    .wrapper{max-width:600px;margin:0 auto;padding:32px 16px 48px;}
    .card{background:#ffffff;border:1px solid #e8d5a3;border-radius:2px;overflow:hidden;}
    @media only screen and (max-width:480px){
      .wrapper{padding:16px 8px 32px;}
      .header-title{font-size:28px !important;}
      .section-pad{padding:20px 16px !important;}
      .items-table td,.items-table th{padding:10px 8px !important;font-size:12px !important;}
      .hide-mobile{display:none !important;}
      .total-row td{font-size:14px !important;}
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1a1a 0%,#2c2c2c 100%);padding:36px 32px 28px;text-align:center;">
      <p style="margin:0 0 6px;font-family:'Lato',sans-serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#c8a951;font-weight:400;">Afora Skincare</p>
      <h1 class="header-title" style="margin:0 0 10px;font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:300;color:#ffffff;letter-spacing:3px;">Order Confirmed</h1>
      <p style="margin:0;font-size:13px;color:#a0916e;font-weight:300;">Thank you for choosing AFORA, ${params.customer_name.split(' ')[0]}.</p>
    </div>

    <!-- Order badge -->
    <div style="background:#fdf9f2;border-bottom:1px solid #f0e6cc;padding:20px 32px;" class="section-pad">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;">Order Number</p>
            <p style="margin:0;font-size:18px;font-family:monospace;font-weight:700;color:#2c2c2c;letter-spacing:1px;">${params.order_number}</p>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <p style="margin:0 0 3px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;">Date</p>
            <p style="margin:0;font-size:13px;color:#777;">${params.order_date}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items table -->
    <div style="padding:28px 32px 0;" class="section-pad">
      <p style="margin:0 0 14px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;font-weight:500;">Items Ordered</p>
      <table class="items-table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#faf5ec;">
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#aaa;border-bottom:1px solid #f0e6cc;">Product</th>
            <th style="padding:10px 16px;text-align:center;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#aaa;border-bottom:1px solid #f0e6cc;">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#aaa;border-bottom:1px solid #f0e6cc;" class="hide-mobile">Price</th>
            <th style="padding:10px 16px;text-align:right;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#aaa;border-bottom:1px solid #f0e6cc;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Pricing summary -->
    <div style="padding:20px 32px 28px;" class="section-pad">
      <table style="width:100%;border-collapse:collapse;margin-left:auto;max-width:300px;">
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#999;">Subtotal</td>
          <td style="padding:5px 0;text-align:right;font-size:13px;color:#555;">Rs.&nbsp;${params.subtotal.toLocaleString()}</td>
        </tr>
        ${params.discount_amount > 0 ? `<tr>
          <td style="padding:5px 0;font-size:13px;color:#22a06b;">Discount</td>
          <td style="padding:5px 0;text-align:right;font-size:13px;color:#22a06b;">−&nbsp;Rs.&nbsp;${params.discount_amount.toLocaleString()}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#999;">Delivery</td>
          <td style="padding:5px 0;text-align:right;font-size:13px;color:#555;">${params.delivery_charges === 0 ? '<span style="color:#22a06b;font-weight:500;">Free</span>' : `Rs.&nbsp;${params.delivery_charges.toLocaleString()}`}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0;"><div style="border-top:1px solid #f0e6cc;margin:4px 0;"></div></td>
        </tr>
        <tr class="total-row">
          <td style="padding:6px 0;font-size:16px;font-weight:700;color:#2c2c2c;">Total</td>
          <td style="padding:6px 0;text-align:right;font-size:16px;font-weight:700;color:#c8a951;">Rs.&nbsp;${params.total.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:linear-gradient(to right,transparent,#e8d5a3,transparent);margin:0 32px;"></div>

    <!-- Shipping info -->
    <div style="padding:28px 32px;" class="section-pad">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;padding-right:24px;width:50%;">
            <p style="margin:0 0 10px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;font-weight:500;">Shipping To</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#2c2c2c;">${params.customer_name}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#666;line-height:1.6;">${params.address}<br/>${params.city}, ${params.postal_code}</p>
          </td>
          <td style="vertical-align:top;width:50%;">
            <p style="margin:0 0 10px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;font-weight:500;">Contact</p>
            <p style="margin:0;font-size:13px;color:#666;">${params.phone}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#666;">${params.customer_email}</p>
          </td>
        </tr>
      </table>
      ${params.notes ? `<div style="margin-top:16px;padding:12px 16px;background:#fdf9f2;border-left:2px solid #c8a951;">
        <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Order Notes</p>
        <p style="margin:0;font-size:13px;color:#666;font-style:italic;">${params.notes}</p>
      </div>` : ''}
    </div>

    <!-- Payment + tracking hint -->
    <div style="background:#fdf9f2;border-top:1px solid #f0e6cc;padding:20px 32px;" class="section-pad">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:12px;">
            <p style="margin:0 0 4px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;">Payment</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#2c2c2c;">Cash on Delivery</p>
          </td>
          <td style="vertical-align:top;text-align:right;">
            <p style="margin:0 0 4px;font-size:10px;color:#aaa;letter-spacing:3px;text-transform:uppercase;">Track Order</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#c8a951;">${params.order_number}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:28px 32px;text-align:center;" class="section-pad">
      <p style="margin:0 0 16px;font-size:13px;color:#999;line-height:1.7;">Your order is being prepared. You can track your delivery using your order number at any time.</p>
      <a href="https://afora-official.com/track" style="display:inline-block;background:#2c2c2c;color:#ffffff;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:13px 32px;font-family:'Lato',sans-serif;font-weight:500;">Track My Order</a>
    </div>

    <!-- Footer -->
    <div style="background:#1a1a1a;padding:24px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c8a951;">AFORA</p>
      <p style="margin:0;font-size:11px;color:#666;line-height:1.6;">by Sidra Shahzad &nbsp;·&nbsp; <a href="https://afora-official.com" style="color:#888;text-decoration:none;">afora-official.com</a></p>
    </div>

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
        from: 'AFORA <onboarding@resend.dev>',
        to: params.customer_email,
        subject: `Order Confirmed — ${params.order_number} 🤍`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend customer confirmation failed:', err);
    }
  } catch (err) {
    console.error('Resend customer confirmation error:', err);
  }
}

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
