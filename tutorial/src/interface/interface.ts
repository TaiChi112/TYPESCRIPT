interface Car2 {
    type:string
    model:string
    color:string
}
interface Person1 {
    name:string
    age:number
}
interface Person2 {
    name:string
    age:number
    display(name:string,age:number):void
}

export {Car2,Person1,Person2}
// export interface ICreateUser {
//     username: string
//     password: string
//     email: string
//     createAt: Date
// }
// export interface IUser extends ICreateUser {
//     userId: string
// }
// export interface IRepositoryUser {
//     createUser(user: ICreateUser): Promise<IUser | null>
//     getUserByUsername(username: string): Promise<IUser | null>
//     getUserById(id: string): Promise<IUser | null>
//     getUsername(username: string): Promise<IUser | null>
// }