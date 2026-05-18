'use client'

import { useState, useEffect } from 'react'

export type Product = {
  id: string
  name: string
  category_id: string
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  total_sold: number
  tax_percent: number
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !categoryFilter || product.category_id === categoryFilter
    return matchSearch && matchCategory && product.is_active
  })

  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    refetch: fetchProducts,
  }
}
