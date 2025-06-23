export class User{
    private id: number;
    private name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
    get_id(): number {
        return this.id;
    }
    get_name(): string {
        return this.name;
    }
    show_info_user(): string {
        return `User ID: ${this.id}, Name: ${this.name}`;
    }
}