export type InstitutionType = 'university' | 'college' | 'school';
export type BookCondition = 'new' | 'good' | 'worn';
export type BookStatus = 'available' | 'sold';
export type AppRole = 'admin' | 'user';

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

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  institution_type: InstitutionType | null;
  institution_id: string | null;
  subcategory: string | null;
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
  condition: BookCondition;
  price: number;
  seller_id: string;
  status: BookStatus;
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

// Subcategory options
export const COLLEGE_DIVISIONS = ['Science', 'Commerce', 'Arts'] as const;
export const SCHOOL_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
