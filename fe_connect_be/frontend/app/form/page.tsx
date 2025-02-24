"use client"
import { useState } from "react"
export default function FormPage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
    })
    const [loading, setLoading] = useState(false)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch("http://localhost:4000/api/form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            console.log("Data inserted:", data)

            if (response.ok) {
                alert("Data inserted successfully!")
                setFormData({
                    name: "",
                    description: "",
                    price: 0
                })
            } else {
                alert("Error inserting data!" + data.error)
            }
        } catch (error) {
            console.error("Error inserting data: ", error)
            alert("Something went wrong!")
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <h1>Contact Form</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </>
    )
}
