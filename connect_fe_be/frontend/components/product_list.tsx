'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  price: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])
  console.log(products)
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} - ${p.price}</li>
      ))}
    </ul>
  )
}
