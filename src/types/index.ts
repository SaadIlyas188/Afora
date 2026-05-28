export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  how_to_use: string;
  price: number;
  compare_at_price: number | null;
  category_id: string;
  step_number: number | null;
  can_use_individually: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  ingredients?: ProductIngredient[];
  average_rating?: number;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  ingredient_name: string;
  ingredient_description: string;
  sort_order: number;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  products?: Product[];
  images?: BundleImage[];
}

export interface BundleImage {
  id: string;
  bundle_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface BundleProduct {
  id: string;
  bundle_id: string;
  product_id: string;
  sort_order: number;
  product?: Product;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  role: 'customer' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  subtotal: number;
  delivery_charges: number;
  discount_amount: number;
  promo_code_id: string | null;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  promo_code?: PromoCode;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  bundle_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  title: string | null;
  description: string | null;
  comment?: string | null;
  is_approved: boolean;
  created_at: string;
  profile?: Profile;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  discount_type: 'fixed' | 'percentage';
  min_order_amount: number;
  is_active: boolean;
  usage_limit: number | null;
  times_used: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Cart types (client-side)
export interface CartItem {
  id: string; // product_id or bundle_id
  type: 'product' | 'bundle';
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  slug: string;
}

export interface CartState {
  items: CartItem[];
  promoCode: AppliedPromo | null;
}

export interface AppliedPromo {
  code: string;
  discount_amount: number;
  discount_type: 'fixed' | 'percentage';
}

export interface CheckoutFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
}

export interface SiteSettings {
  contact_email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  about_text: string;
  delivery_charges: string;
  announcement_text: string;
  // legacy aliases kept for compatibility
  whatsapp_number?: string;
  instagram_username?: string;
  facebook_url?: string;
  announcement_bar_text?: string;
}
