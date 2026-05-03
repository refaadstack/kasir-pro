'use client'
import { useReducer, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  sku: string
  qty: number
  emoji?: string
  imageUrl?: string
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'qty'> }
  | { type: 'UPDATE_QTY'; payload: { id: string; qty: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.find(item => item.sku === action.payload.sku)
      if (existingItem) {
        return state.map(item =>
          item.sku === action.payload.sku
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...state, { ...action.payload, qty: 1 }]

    case 'UPDATE_QTY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, qty: Math.max(1, action.payload.qty) }
          : item
      ).filter(item => item.qty > 0)

    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload)

    case 'CLEAR_CART':
      return []

    default:
      return state
  }
}

export function useCart() {
  const [cart, dispatch] = useReducer(cartReducer, [])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  return { cart, addItem, updateQty, removeItem, clearCart, totalItems, totalPrice }
}