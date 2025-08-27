'use client'

import { useState } from 'react'

type Product = {
    name: string
    price: number
    description: string
}

export default function ProductForm() {
    const [formData, setFormData] = useState<Product>({
        name: '',
        price: 0,
        description: ''
    })

    const [response, setResponse] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('http://localhost:3001/api/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        const data = await res.json()
        setResponse(JSON.stringify(data, null, 2))
    }

    return (
        <div className="max-w-xl mx-auto p-4 border rounded space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">product name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block">product price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block">product description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Submit Product
                </button>
            </form>

            {response && (
                <div className="bg-gray-100 p-2 rounded whitespace-pre-wrap font-mono">
                    <strong>📨 Response from Backend:</strong>
                    <pre>{response}</pre>
                </div>
            )}
        </div>
    )
}
