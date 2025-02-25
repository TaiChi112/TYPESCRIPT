"use client"
import { useState } from "react";
interface Some {
    id: number;
    name: string;
}
export default function AllState() {
    const [some, setSome] = useState<Some | null>({ id: 1, name: "Some" });
    const [formSome, setFormSome] = useState<Some | null>({ id: 0, name: "" });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormSome(prevState => ({
            ...prevState,
            [name]: name === "id" ? parseInt(value) : value
        } as Some));
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSome(formSome);
        setFormSome({ id: 0, name: "" });
    };
    return (
        <>
            <h1>Form Some</h1>
            <div>{some?.id}</div>
            <div>{some?.name}</div>
            <form onSubmit={handleSubmit}>
                <label>id: </label>
                <input
                    type="number"
                    name="id"
                    value={formSome?.id}
                    onChange={handleChange}
                    required
                />
                <label>name: </label>
                <input
                    type="text"
                    name="name"
                    value={formSome?.name}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </>
    )
}
