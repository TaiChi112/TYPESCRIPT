type personfields = {
    id: number;
    name: string;
    description?: string;
}
interface IPerson {

    showDetails(): string;
}
export class Person implements IPerson {
    constructor(public data: personfields) {
        if (!data.id || !data.name) {
            throw new Error('ID and Name are required fields');
        }
        this.data.description = data.description ?? '';
    }
    showDetails(): string {
        return `ID: ${this.data.id}, Name: ${this.data.name}, Description: ${this.data.description}`;
    }
}

// test cases
export const person1: Person[] =
    [new Person({
        id: 1, name: 'John Doe', description: 'A sample person'
    }), new Person({
        id: 2, name: 'Jane Smith'
    }), new Person({
        id: 3, name: 'Alice Johnson', description: 'Another sample person'
    })];