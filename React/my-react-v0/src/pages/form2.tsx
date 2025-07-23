import { useState } from "react"
interface User {
    id: number;
    name: string;
    phone: string;
}
export default function Form2() {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [submit, setSubmit] = useState<User[]>([]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (name.trim() !== '' && phone.trim() !== '') {
            const newUser: User = {
                id: submit.length + 1,
                name: name.trim(),
                phone: phone.trim()
            };
            setSubmit([...submit, newUser]);
            setName('');
            setPhone('');
        } else {
            alert('Please enter some data before submitting!');
        }
    }
    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            <ul>
                {submit.map((item) => (
                    <li key={item.id}>{item.id} {item.name} {item.phone}</li>
                ))}
            </ul>
        </>
    )
}
