export type InstitutionType = 'university' | 'college' | 'school' | 'national_university';
export type BookCondition = 'new' | 'good' | 'worn';
export type BookStatus = 'available' | 'sold';
export type BookType = 'academic' | 'non_academic' | 'nilkhet';
export type AppRole = 'admin' | 'user';
export type DemandStatus = 'requested' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  created_at: string;
}

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  created_at: string;
}

export interface AcademicDepartment {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  whatsapp_number: string | null;
  institution_type: InstitutionType | null;
  institution_id: string | null;
  subcategory: string | null;
  department_id: string | null;
  academic_department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  institution_type: InstitutionType;
  institution_id: string;
  subcategory: string | null;
  department_id: string | null;
  academic_department_id: string | null;
  condition: BookCondition;
  price: number;
  seller_id: string;
  status: BookStatus;
  book_type: BookType;
  is_admin_listing: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithSeller extends Book {
  seller?: Profile;
  institution?: Institution;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// BD Location Types
export interface BDDivision {
  id: string;
  name: string;
  bn_name: string | null;
  created_at: string;
}

export interface BDDistrict {
  id: string;
  division_id: string;
  name: string;
  bn_name: string | null;
  created_at: string;
}

export interface BDThana {
  id: string;
  district_id: string;
  name: string;
  bn_name: string | null;
  created_at: string;
}

export interface BDWard {
  id: string;
  thana_id: string;
  name: string;
  created_at: string;
}

export interface BookDemand {
  id: string;
  user_id: string;
  profile_id: string;
  book_name: string;
  author_name: string | null;
  division_id: string | null;
  district_id: string | null;
  thana_id: string | null;
  ward_id: string | null;
  detail_address: string | null;
  status: DemandStatus;
  admin_notes: string | null;
  demand_number: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  division?: BDDivision;
  district?: BDDistrict;
  thana?: BDThana;
  ward?: BDWard;
}

export interface Order {
  id: string;
  user_id: string;
  profile_id: string;
  book_id: string;
  quantity: number;
  total_price: number;
  division_id: string | null;
  district_id: string | null;
  thana_id: string | null;
  ward_id: string | null;
  detail_address: string | null;
  status: OrderStatus;
  admin_notes: string | null;
  order_number: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  book?: Book;
  division?: BDDivision;
  district?: BDDistrict;
  thana?: BDThana;
  ward?: BDWard;
}

export interface AdminNotification {
  id: string;
  type: 'signup' | 'book_demand' | 'order' | 'new_listing' | 'book_sold';
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
}

// Subcategory options
export const COLLEGE_DIVISIONS = ['Science', 'Commerce', 'Arts'] as const;
export const SCHOOL_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

// Status labels
export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  requested: 'Requested',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
