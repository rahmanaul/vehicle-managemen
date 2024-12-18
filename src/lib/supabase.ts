import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      asn: {
        Row: {
          id: string
          nip: string
          name: string
          position: string
          instansi_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nip: string
          name: string
          position: string
          instansi_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nip?: string
          name?: string
          position?: string
          instansi_id?: string
          created_at?: string
        }
      }
      instansi: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          nopol: string
          wheel_count: number
          brand: string
          type: string
          year: number
          asn_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nopol: string
          wheel_count: number
          brand: string
          type: string
          year: number
          asn_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nopol?: string
          wheel_count?: number
          brand?: string
          type?: string
          year?: number
          asn_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
