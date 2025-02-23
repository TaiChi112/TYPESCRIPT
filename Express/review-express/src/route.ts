import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const bookRoute = Router();
const userRoute = Router();
const prisma = new PrismaClient();

bookRoute.get('/books', async (req: Request, res: Response) => {
    const books = await prisma.book.findMany();
    res.json(books);
})
bookRoute.post('/books', async (req: Request, res: Response) => {
    const { title, author } = req.body;
    const book = await prisma.book.create({
        data: {
            title,
            author
        }
    })
    res.json(book);
})
userRoute.get('/users', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
})
userRoute.post('/users', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    })
    res.json(newUser);
})

userRoute.put('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const updateUser = await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            name,
            email,
        }
    })
    res.json(updateUser);
})

userRoute.delete('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleteUser = await prisma.user.delete({
        where: {
            id: Number(id)
        }
    })
    res.json(deleteUser);
})
export { bookRoute, userRoute } 