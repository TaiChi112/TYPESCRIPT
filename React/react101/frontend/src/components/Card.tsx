import { useEffect, useState } from 'react'
import { User } from '../interface/user'
import axios from 'axios'
// import { mockDataUser } from "../mock/data"

export default function Card() {
    const [users, setUsers] = useState<User[]>([])
    useEffect(() => {
        axios.get<User[]>('http://localhost:3000/api/users')
            .then((response: any) => {
                setUsers(response.data);
            })
            .catch((error: any) => {
                console.error('There was an error fetching the users', error)
            })
    })
    // const user: User[] = mockDataUser
    return (
        <div>
            <h2 className='text-2xl font-bold underline'>User List Card</h2>
            <ul>
                {users.map(({ id, name, email }) => (
                    <li key={id}>
                        {name} - {email}
                    </li>
                ))}
            </ul>
        </div>
    )
}
