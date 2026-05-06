'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  subtotal: number
  stock: number
}

type CartState = {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'qty' | 'subtotal'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

type CartContextType = CartState & {
  addItem: (item: Omit<CartItem, 'qty' | 'subtotal'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'kasirpro_cart'

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id)
      
      if (existingIndex >= 0) {
        // Item sudah ada, tambah qty
        const newItems = [...state.items]
        const newQty = newItems[existingIndex].qty + 1
        
        // Cek stok
        if (newQty > action.payload.stock) {
          return state // Tidak bisa tambah, stok tidak cukup
        }
        
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          qty: newQty,
          subtotal: newQty * newItems[existingIndex].price,
        }
        
        const total = newItems.reduce((sum, item) => sum + item.subtotal, 0)
        return { items: newItems, total }
      } else {
        // Item baru
        const newItem: CartItem = {
          ...action.payload,
          qty: 1,
          subtotal: action.payload.price,
        }
        const newItems = [...state.items, newItem]
        const total = newItems.reduce((sum, item) => sum + item.subtotal, 0)
        return { items: newItems, total }
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      return { items: newItems, total }
    }

    case 'UPDATE_QTY': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const newQty = Math.max(1, Math.min(action.payload.qty, item.stock))
          return {
            ...item,
            qty: newQty,
            subtotal: newQty * item.price,
          }
        }
        return item
      })
      const total = newItems.reduce((sum, item) => sum + item.subtotal, 0)
      return { items: newItems, total }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 }

    case 'LOAD_CART':
      return action.payload

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  // Load dari sessionStorage saat mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        dispatch({ type: 'LOAD_CART', payload: parsed })
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }
  }, [])

  // Save ke sessionStorage setiap kali state berubah
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addItem = (item: Omit<CartItem, 'qty' | 'subtotal'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQty = (id: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within CartProvider')
  }
  return context
}
