import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {userRoute, bookRoute} from './route';


const server = express();
const port = 8088;
const prisma = new PrismaClient();

server.use(express.json());
server.use(userRoute);
server.use(bookRoute);

server.get('/', (req: Request, res: Response) => {
    res.json({
        msg: "Server running success",
        status: "ok",
    })
});

server.listen(port, () => {
    console.log(`Server running http://localhost/${port}`);
});


// const Ebooks = [
//     {
//         name: "Ebook 1",
//         author: "Author 1",
//     },
//     {
//         name: "Ebook 2",
//         author: "Author 2",
//     },
//     {
//         name: "Ebook 3",
//         author: "Author 3",
//     },
// ]