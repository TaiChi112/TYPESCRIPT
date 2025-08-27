import { Router, Request, Response } from 'express'
import db from '../db/db'

const router = Router()

router.get('/api/users', async (req: Request, res: Response) => {
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

export { router as usersRouter }