import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from '@/context/CartContext'
import { useCart } from '@/hooks/useCart'

describe('CartContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 10000,
        stock: 10,
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Test Product')
    expect(result.current.items[0].qty).toBe(1)
    expect(result.current.total).toBe(10000)
  })

  it('should increase quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    const product = {
      id: '1',
      name: 'Test Product',
      price: 10000,
      stock: 10,
    }

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(2)
    expect(result.current.total).toBe(20000)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 10000,
        stock: 10,
      })
    })

    expect(result.current.items).toHaveLength(1)

    act(() => {
      result.current.removeItem('1')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 10000,
        stock: 10,
      })
    })

    act(() => {
      result.current.updateQty('1', 5)
    })

    expect(result.current.items[0].qty).toBe(5)
    expect(result.current.total).toBe(50000)
  })

  it('should not allow quantity less than 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 10000,
        stock: 10,
      })
    })

    act(() => {
      result.current.updateQty('1', 0)
    })

    expect(result.current.items[0].qty).toBe(1)
  })

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Product 1',
        price: 10000,
        stock: 10,
      })
      result.current.addItem({
        id: '2',
        name: 'Product 2',
        price: 20000,
        stock: 5,
      })
    })

    expect(result.current.items).toHaveLength(2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('should calculate total correctly with multiple items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Product 1',
        price: 10000,
        stock: 10,
      })
      result.current.addItem({
        id: '2',
        name: 'Product 2',
        price: 20000,
        stock: 5,
      })
      result.current.updateQty('1', 3)
    })

    // (10000 * 3) + (20000 * 1) = 50000
    expect(result.current.total).toBe(50000)
  })
})
