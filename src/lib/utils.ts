export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-PK')}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AFORA-${dateStr}-${random}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'Your order has been placed and is awaiting confirmation.',
    confirmed: "We've received your order and it's being prepared!",
    processing: 'Your order is being carefully packed.',
    shipped: 'Your order is on its way to you!',
    delivered: 'Your order has been delivered. Enjoy!',
    cancelled: 'This order has been cancelled.',
  };
  return messages[status] || '';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder-product.svg';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export const DELIVERY_CHARGES = 250;

export const ORDER_STATUSES = [
  'pending',
  'confirmed', 
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const PAKISTANI_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
  'Sukkur', 'Sahiwal', 'Sheikhupura', 'Larkana', 'Jhang',
  'Gujrat', 'Kasur', 'Dera Ghazi Khan', 'Muzaffargarh', 'Okara',
  'Mirpur Khas', 'Chiniot', 'Nawabshah', 'Mingora', 'Kamoke',
];
