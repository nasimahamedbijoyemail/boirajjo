import { Profile, OrderStatus, BookCondition } from './database';

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  phone_number: string;
  whatsapp_number: string | null;
  address: string | null;
  logo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShopBook {
  id: string;
  shop_id: string;
  title: string;
  author: string;
  price: number;
  condition: BookCondition;
  book_condition_type: 'old' | 'new';
  category: string;
  subcategory: string;
  photo_url: string | null;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  shop?: Shop;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  shop_id: string;
  user_id: string;
  profile_id: string;
  shop_book_id: string;
  quantity: number;
  total_price: number;
  division_id: string | null;
  district_id: string | null;
  thana_id: string | null;
  detail_address: string | null;
  status: OrderStatus;
  customer_notes: string | null;
  shop_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  shop?: Shop;
  shop_book?: ShopBook;
  profile?: Profile;
}

export interface ShopRating {
  id: string;
  shop_id: string;
  user_id: string;
  profile_id: string;
  shop_order_id: string | null;
  rating: number;
  review: string | null;
  created_at: string;
  profile?: Profile;
}

export interface ContactUnlockPayment {
  id: string;
  transaction_number: string;
  user_id: string;
  profile_id: string;
  book_id: string;
  amount: number;
  bkash_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  book?: {
    id: string;
    title: string;
    author: string;
    price: number;
    seller_id: string;
    seller?: Profile;
  };
}

export const BKASH_NUMBER = '01786698614';
