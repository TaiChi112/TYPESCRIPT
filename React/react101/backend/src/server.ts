import express, { Request, Response } from 'express';
import cors from "cors"
import { users } from "./mock/user"
import db from "./db/db"


const app = express()
const port = 3000

app.use(cors())

app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const query = 'select * from users'
        const result = await db.query(query)
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching users : ', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
})
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})