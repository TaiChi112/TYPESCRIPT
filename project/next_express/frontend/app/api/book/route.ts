import { NextResponse } from "next/server"

let books:{title:string,author:string,price:string}[] = []
export async function GET(){
    return NextResponse.json(books)
}
export async function POST(req: Request) {
    const body = await req.json()
    const newBook = {
        ...body
    }
    books.push(newBook)
    return NextResponse.json(newBook,{status:201})
}