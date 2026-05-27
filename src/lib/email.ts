import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const ORDER_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER!;
const CONTACT_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

interface OrderEmailParams {
  to_email: string;
  to_name: string;
  order_number: string;
  order_date: string;
  items_html: string;
  subtotal: string;
  delivery: string;
  discount: string;
  total: string;
  address: string;
  city: string;
  phone: string;
}

interface ContactEmailParams {
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  to_email: string;
}

export async function sendOrderConfirmation(params: OrderEmailParams) {
  try {
    await emailjs.send(SERVICE_ID, ORDER_TEMPLATE, params as unknown as Record<string, unknown>, PUBLIC_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to send order email:', error);
    return { success: false, error };
  }
}

export async function sendContactEmail(params: ContactEmailParams) {
  try {
    await emailjs.send(SERVICE_ID, CONTACT_TEMPLATE, params as unknown as Record<string, unknown>, PUBLIC_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return { success: false, error };
  }
}

export function buildOrderItemsHtml(items: { product_name: string; quantity: number; unit_price: number; total_price: number }[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E8D5A3; font-family: 'Inter', sans-serif;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8D5A3; text-align: center; font-family: 'Inter', sans-serif;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8D5A3; text-align: right; font-family: 'Inter', sans-serif;">Rs. ${item.unit_price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8D5A3; text-align: right; font-family: 'Inter', sans-serif;">Rs. ${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: linear-gradient(135deg, #D4AF37, #E8D5A3);">
          <th style="padding: 12px; text-align: left; color: white; font-family: 'Inter', sans-serif;">Product</th>
          <th style="padding: 12px; text-align: center; color: white; font-family: 'Inter', sans-serif;">Qty</th>
          <th style="padding: 12px; text-align: right; color: white; font-family: 'Inter', sans-serif;">Price</th>
          <th style="padding: 12px; text-align: right; color: white; font-family: 'Inter', sans-serif;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
