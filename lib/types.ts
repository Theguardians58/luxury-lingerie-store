export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          category_id: number | null
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          category_id?: number | null
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          category_id?: number | null
          slug?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          id: number
          product_id: number
          size: string
          color: string
          stock_quantity: number
        }
        Insert: {
          id?: number
          product_id: number
          size: string
          color: string
          stock_quantity?: number
        }
        Update: {
          id?: number
          product_id?: number
          size?: string
          color?: string
          stock_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          alt_text: string | null
        }
        Insert: {
          id?: number
          product_id: number
          image_url: string
          alt_text?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          image_url?: string
          alt_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          shipping_address: Json | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          shipping_address?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          shipping_address?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: number
          user_id: string | null
          total_amount: number
          status: string
          created_at: string
          shipping_address: Json | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          total_amount: number
          status?: string
          created_at?: string
          shipping_address?: Json | null
        }
        Update: {
          id?: number
          user_id?: string | null
          total_amount?: number
          status?: string
          created_at?: string
          shipping_address?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          variant_id: number | null
          quantity: number
          price: number
        }
        Insert: {
          id?: number
          order_id: number
          variant_id?: number | null
          quantity: number
          price: number
        }
        Update: {
          id?: number
          order_id?: number
          variant_id?: number | null
          quantity?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper type for product with related data
export type ProductWithDetails = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
  product_images: Database['public']['Tables']['product_images']['Row'][];
  product_variants: Database['public']['Tables']['product_variants']['Row'][];
};
