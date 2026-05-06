export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          role: 'SUPERADMIN' | 'MANAGER' | 'KASIR'
          phone: string | null
          pin: string | null
          is_active: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          role: 'SUPERADMIN' | 'MANAGER' | 'KASIR'
          phone?: string | null
          pin?: string | null
          is_active?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          name?: string | null
          role?: 'SUPERADMIN' | 'MANAGER' | 'KASIR'
          phone?: string | null
          pin?: string | null
          is_active?: boolean
          updatedAt?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          emoji: string
        }
        Insert: {
          id?: string
          name: string
          emoji?: string
        }
        Update: {
          name?: string
          emoji?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string
          price: number
          stock: number
          categoryId: string | null
          imageUrl: string | null
          emoji: string
          is_active: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          name: string
          sku: string
          price: number
          stock?: number
          categoryId?: string | null
          imageUrl?: string | null
          emoji?: string
          is_active?: boolean
        }
        Update: {
          name?: string
          sku?: string
          price?: number
          stock?: number
          categoryId?: string | null
          imageUrl?: string | null
          emoji?: string
          is_active?: boolean
        }
      }
      shifts: {
        Row: {
          id: string
          shiftId: string
          userId: string
          startTime: string
          endTime: string | null
          openingCash: number | null
          closingCash: number | null
          totalSales: number
        }
        Insert: {
          shiftId: string
          userId: string
          startTime?: string
          endTime?: string | null
          openingCash?: number | null
          closingCash?: number | null
          totalSales?: number
        }
      }
      transactions: {
        Row: {
          id: string
          trxId: string
          userId: string
          shiftId: string | null
          totalAmount: number
          paymentMethod: 'TUNAI' | 'QRIS' | 'TRANSFER'
          cashReceived: number | null
          change: number | null
          status: 'SUCCESS' | 'VOID'
          voidReason: string | null
          voidBy: string | null
          voidAt: string | null
          createdAt: string
        }
      }
    }
    Enums: {
      Role: 'SUPERADMIN' | 'MANAGER' | 'KASIR'
      PaymentMethod: 'TUNAI' | 'QRIS' | 'TRANSFER'
      TransactionStatus: 'SUCCESS' | 'VOID'
    }
  }
}

