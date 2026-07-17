export type ProductStatus = "available" | "unavailable";
export type OrderStatus = "new" | "preparing" | "ready" | "delivered" | "cancelled";
export type UserRole = "owner" | "worker";
export type ThemeName = "red" | "white";
export type PaymentMethod = "cash" | "instapay" | "wallet";
export type HomeSectionType = "categories" | "products";

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
}

export interface HomeSection {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  section_type: HomeSectionType;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
  home_section_id: string | null;
  purchase_price: number;
  sale_price: number;
  discount_price: number | null;
  status: ProductStatus;
  is_featured: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  notes: string | null;
  status: OrderStatus;
  delivery_fee: number;
  total: number;
  acknowledged: boolean;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  sale_price: number;
  purchase_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  order_id: string;
  total_sale: number;
  total_purchase: number;
  profit: number;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  store_name_en: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  delivery_fee: number;
  min_order: number;
  working_hours: string | null;
  theme: ThemeName;
  banner_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  announcement: string | null;
  announcement_enabled: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  active: boolean;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "جديد",
  preparing: "جاري التجهيز",
  ready: "تم التجهيز",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "كاش عند الاستلام",
  instapay: "إنستاباي",
  wallet: "محفظة إلكترونية",
};

// السعر الفعلي اللي المفروض يتحاسب بيه العميل (سعر الخصم لو موجود، وإلا سعر البيع العادي)
export function getEffectivePrice(product: { sale_price: number; discount_price: number | null }): number {
  if (product.discount_price != null && product.discount_price > 0 && product.discount_price < product.sale_price) {
    return product.discount_price;
  }
  return product.sale_price;
}
