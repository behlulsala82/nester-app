export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          material: string
          board_width: number
          board_height: number
          total_sheets: number
          waste_percent: number
          efficiency_score: number
          selected_strategy: string
          placements_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material: string
          board_width: number
          board_height: number
          total_sheets: number
          waste_percent: number
          efficiency_score: number
          selected_strategy: string
          placements_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material?: string
          board_width?: number
          board_height?: number
          total_sheets?: number
          waste_percent?: number
          efficiency_score?: number
          selected_strategy?: string
          placements_data?: Json
          created_at?: string
        }
      }
      pieces: {
        Row: {
          id: string
          order_id: string
          width: number
          height: number
          quantity: number
          rotation: boolean
          edge_top: boolean
          edge_bottom: boolean
          edge_left: boolean
          edge_right: boolean
        }
        Insert: {
          id?: string
          order_id: string
          width: number
          height: number
          quantity?: number
          rotation?: boolean
          edge_top?: boolean
          edge_bottom?: boolean
          edge_left?: boolean
          edge_right?: boolean
        }
        Update: {
          id?: string
          order_id?: string
          width?: number
          height?: number
          quantity?: number
          rotation?: boolean
          edge_top?: boolean
          edge_bottom?: boolean
          edge_left?: boolean
          edge_right?: boolean
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type User = Tables<'users'>
export type Order = Tables<'orders'>
export type Piece = Tables<'pieces'>
