export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_departments: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          email_sent: boolean
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      bd_districts: {
        Row: {
          bn_name: string | null
          created_at: string
          division_id: string
          id: string
          name: string
        }
        Insert: {
          bn_name?: string | null
          created_at?: string
          division_id: string
          id?: string
          name: string
        }
        Update: {
          bn_name?: string | null
          created_at?: string
          division_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_districts_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "bd_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_divisions: {
        Row: {
          bn_name: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          bn_name?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          bn_name?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      bd_thanas: {
        Row: {
          bn_name: string | null
          created_at: string
          district_id: string
          id: string
          name: string
        }
        Insert: {
          bn_name?: string | null
          created_at?: string
          district_id: string
          id?: string
          name: string
        }
        Update: {
          bn_name?: string | null
          created_at?: string
          district_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_thanas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "bd_districts"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_wards: {
        Row: {
          created_at: string
          id: string
          name: string
          thana_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          thana_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          thana_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bd_wards_thana_id_fkey"
            columns: ["thana_id"]
            isOneToOne: false
            referencedRelation: "bd_thanas"
            referencedColumns: ["id"]
          },
        ]
      }
      book_demands: {
        Row: {
          admin_notes: string | null
          author_name: string | null
          book_name: string
          created_at: string
          demand_number: string | null
          detail_address: string | null
          district_id: string | null
          division_id: string | null
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["demand_status"]
          thana_id: string | null
          updated_at: string
          user_id: string
          ward_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          author_name?: string | null
          book_name: string
          created_at?: string
          demand_number?: string | null
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["demand_status"]
          thana_id?: string | null
          updated_at?: string
          user_id: string
          ward_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          author_name?: string | null
          book_name?: string
          created_at?: string
          demand_number?: string | null
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["demand_status"]
          thana_id?: string | null
          updated_at?: string
          user_id?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_demands_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "bd_districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_demands_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "bd_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_demands_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_demands_thana_id_fkey"
            columns: ["thana_id"]
            isOneToOne: false
            referencedRelation: "bd_thanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_demands_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "bd_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          academic_department_id: string | null
          author: string
          book_type: string
          category: string | null
          condition: Database["public"]["Enums"]["book_condition"]
          created_at: string
          department_id: string | null
          id: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_admin_listing: boolean
          photo_url: string | null
          price: number
          seller_id: string
          status: Database["public"]["Enums"]["book_status"]
          subcategory: string | null
          subcategory_detail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_department_id?: string | null
          author: string
          book_type?: string
          category?: string | null
          condition?: Database["public"]["Enums"]["book_condition"]
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_admin_listing?: boolean
          photo_url?: string | null
          price: number
          seller_id: string
          status?: Database["public"]["Enums"]["book_status"]
          subcategory?: string | null
          subcategory_detail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_department_id?: string | null
          author?: string
          book_type?: string
          category?: string | null
          condition?: Database["public"]["Enums"]["book_condition"]
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_admin_listing?: boolean
          photo_url?: string | null
          price?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["book_status"]
          subcategory?: string | null
          subcategory_detail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_academic_department_id_fkey"
            columns: ["academic_department_id"]
            isOneToOne: false
            referencedRelation: "academic_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_unlock_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          bkash_number: string
          book_id: string
          created_at: string
          id: string
          profile_id: string
          status: string
          transaction_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bkash_number: string
          book_id: string
          created_at?: string
          id?: string
          profile_id: string
          status?: string
          transaction_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bkash_number?: string
          book_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          status?: string
          transaction_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlock_payments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlock_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      department_book_requests: {
        Row: {
          academic_department_id: string | null
          author_name: string | null
          created_at: string
          department_id: string | null
          id: string
          institution_id: string
          profile_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_department_id?: string | null
          author_name?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id: string
          profile_id: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_department_id?: string | null
          author_name?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id?: string
          profile_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_book_requests_academic_department_id_fkey"
            columns: ["academic_department_id"]
            isOneToOne: false
            referencedRelation: "academic_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_book_requests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_book_requests_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_book_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["institution_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["institution_type"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["institution_type"]
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          book_id: string
          created_at: string
          detail_address: string | null
          district_id: string | null
          division_id: string | null
          id: string
          order_number: string | null
          profile_id: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          thana_id: string | null
          total_price: number
          updated_at: string
          user_id: string
          ward_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          book_id: string
          created_at?: string
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          order_number?: string | null
          profile_id: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          thana_id?: string | null
          total_price: number
          updated_at?: string
          user_id: string
          ward_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          book_id?: string
          created_at?: string
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          order_number?: string | null
          profile_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          thana_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "bd_districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "bd_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_thana_id_fkey"
            columns: ["thana_id"]
            isOneToOne: false
            referencedRelation: "bd_thanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "bd_wards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_department_id: string | null
          created_at: string
          department_id: string | null
          id: string
          institution_id: string | null
          institution_type:
            | Database["public"]["Enums"]["institution_type"]
            | null
          name: string
          phone_number: string
          subcategory: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          academic_department_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id?: string | null
          institution_type?:
            | Database["public"]["Enums"]["institution_type"]
            | null
          name: string
          phone_number: string
          subcategory?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          academic_department_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          institution_id?: string | null
          institution_type?:
            | Database["public"]["Enums"]["institution_type"]
            | null
          name?: string
          phone_number?: string
          subcategory?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_academic_department_id_fkey"
            columns: ["academic_department_id"]
            isOneToOne: false
            referencedRelation: "academic_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_books: {
        Row: {
          author: string
          book_condition_type: string
          category: string
          condition: Database["public"]["Enums"]["book_condition"]
          created_at: string
          id: string
          is_available: boolean | null
          photo_url: string | null
          price: number
          shop_id: string
          stock: number | null
          subcategory: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          book_condition_type: string
          category: string
          condition?: Database["public"]["Enums"]["book_condition"]
          created_at?: string
          id?: string
          is_available?: boolean | null
          photo_url?: string | null
          price: number
          shop_id: string
          stock?: number | null
          subcategory: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          book_condition_type?: string
          category?: string
          condition?: Database["public"]["Enums"]["book_condition"]
          created_at?: string
          id?: string
          is_available?: boolean | null
          photo_url?: string | null
          price?: number
          shop_id?: string
          stock?: number | null
          subcategory?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_books_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_notes: string | null
          detail_address: string | null
          district_id: string | null
          division_id: string | null
          id: string
          order_number: string | null
          profile_id: string
          quantity: number | null
          shop_book_id: string
          shop_id: string
          shop_notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          thana_id: string | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          order_number?: string | null
          profile_id: string
          quantity?: number | null
          shop_book_id: string
          shop_id: string
          shop_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          thana_id?: string | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_notes?: string | null
          detail_address?: string | null
          district_id?: string | null
          division_id?: string | null
          id?: string
          order_number?: string | null
          profile_id?: string
          quantity?: number | null
          shop_book_id?: string
          shop_id?: string
          shop_notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          thana_id?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "bd_districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "bd_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_shop_book_id_fkey"
            columns: ["shop_book_id"]
            isOneToOne: false
            referencedRelation: "shop_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_thana_id_fkey"
            columns: ["thana_id"]
            isOneToOne: false
            referencedRelation: "bd_thanas"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_ratings: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          rating: number
          review: string | null
          shop_id: string
          shop_order_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          rating: number
          review?: string | null
          shop_id: string
          shop_order_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number
          review?: string | null
          shop_id?: string
          shop_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_ratings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_ratings_shop_order_id_fkey"
            columns: ["shop_order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          phone_number: string
          rating_average: number | null
          rating_count: number | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          phone_number: string
          rating_average?: number | null
          rating_count?: number | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          phone_number?: string
          rating_average?: number | null
          rating_count?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      book_condition: "new" | "good" | "worn"
      book_status: "available" | "sold"
      demand_status:
        | "requested"
        | "processing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      institution_type:
        | "university"
        | "college"
        | "school"
        | "national_university"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      book_condition: ["new", "good", "worn"],
      book_status: ["available", "sold"],
      demand_status: [
        "requested",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      institution_type: [
        "university",
        "college",
        "school",
        "national_university",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
