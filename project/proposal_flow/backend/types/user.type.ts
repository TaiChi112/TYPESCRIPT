export type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
}

export type Create_User_DTO = {
    name: string;
    email: string;
    password: string;
}
export type Update_User_DTO = {
    name?: string;
    email?: string;
    password?: string;
}