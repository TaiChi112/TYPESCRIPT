export class Animal {
    private id: number;
    private name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
    show_info_animal():string{
        return `Animal ID: ${this.id}, Name: ${this.name}`;
    }
}