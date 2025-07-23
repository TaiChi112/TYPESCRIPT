import { Client } from "pg"
import dotenv from "dotenv"

dotenv.config()

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env

const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME
})
client.connect()
    .then(() => {
        console.log("Connected to database Postgresql")
    }).catch((err) => {
        console.error('Connection error', err.stack)
    })

export default client