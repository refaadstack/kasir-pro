'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  subtotal: number
  stock: number
  tax_percent: number
}

export type CartDiscount = {
  type: 'percent' | 'fixed'
  value: number
  code?: string // coupon code
  label?: string
}

type CartState = {
  items: CartItem[]
  total: number
  discount: CartDiscount | null
  discountAmount: number
  totalAfterDiscount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'qty' | 'subtotal'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'APPLY_DISCOUNT'; payload: CartDiscount }
  | { type: 'REMOVE_DISCOUNT' }

type CartContextType = CartState & {
  addItem: (item: Omit<CartItem, 'qty' | 'subtotal'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  applyDiscount: (discount: CartDiscount) => void
  removeDiscount: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'kasirpro_cart'

function calculateDiscount(total: number, discount: CartDiscount | null): number {
  if (!discount) return 0
  if (discount.type === 'percent') {
    return Math.round(total * discount.value / 100)
  }
  return Math.min(discount.value, total)
}

function recalculate(items: CartItem[], discount: CartDiscount | null): CartState {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = calculateDiscount(total, discount)
  const totalAfterDiscount = Math.max(0, total - discountAmount)
  return { items, total, discount, discountAmount, totalAfterDiscount }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id)
      
      if (existingIndex >= 0) {
        const newItems = [...state.items]
        const newQty = newItems[existingIndex].qty + 1
        
        if (newQty > action.payload.stock) {
          return state
        }
        
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          qty: newQty,
          subtotal: newQty * newItems[existingIndex].price,
        }
        
        return recalculate(newItems, state.discount)
      } else {
        const newItem: CartItem = {
          ...action.payload,
          qty: 1,
          subtotal: action.payload.price,
        }
        const newItems = [...state.items, newItem]
        return recalculate(newItems, state.discount)
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return recalculate(newItems, state.discount)
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
      return recalculate(newItems, state.discount)
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, discount: null, discountAmount: 0, totalAfterDiscount: 0 }

    case 'LOAD_CART':
      return action.payload

    case 'APPLY_DISCOUNT': {
      return recalculate(state.items, action.payload)
    }

    case 'REMOVE_DISCOUNT': {
      return recalculate(state.items, null)
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, discount: null, discountAmount: 0, totalAfterDiscount: 0 })

  // Load dari sessionStorage saat mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Ensure backward compatibility
        if (!('discount' in parsed)) {
          parsed.discount = null
          parsed.discountAmount = 0
          parsed.totalAfterDiscount = parsed.total || 0
        }
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

  const applyDiscount = (discount: CartDiscount) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: discount })
  }

  const removeDiscount = () => {
    dispatch({ type: 'REMOVE_DISCOUNT' })
  }

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, clearCart, applyDiscount, removeDiscount }}>
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
