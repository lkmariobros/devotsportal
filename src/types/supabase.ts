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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          role: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          role?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          role?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      // Define your views here
    }
    Functions: {
      // Define your functions here
    }
    Enums: {
      // Define your enums here
    }
  }
}