import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json({ users });
    } catch (error: any) {
        return NextResponse.json({
            er: "Error fetching users", error
        })
    }
}

export async function POST(req: Request) {
    try {
        const { name, email } = await req.json();
        const new_user = await prisma.user.create({
            data: {
                name,
                email
            }
        })
        return NextResponse.json({ new_user });
    } catch (error: any) {
        return NextResponse.json({
            er: "Error creating user", error
        })

    }
}
export async function PUT(req: Request) {
    try {
        const { id, name, email } = await req.json();

        const updated_user = await prisma.user.update({
            where: { id },
            data: { name, email }
        })
        return NextResponse.json({ updated_user });
    } catch (error: any) {
        return NextResponse.json({
            er: "Error updating user", error
        })
    }
}
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const deleted_user = await prisma.user.delete({
            where: { id }
        })
        return NextResponse.json({ deleted_user });
    } catch (error: any) {
        return NextResponse.json({
            er: "Error deleting user", error
        })
    }
}