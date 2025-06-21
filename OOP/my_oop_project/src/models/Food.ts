export class Food{
    private id: number;
    private name: string;
    private calories: number;

    constructor(id: number, name: string, calories: number) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    show_info_food(): string {
        return `Food ID: ${this.id}, Name: ${this.name}, Calories: ${this.calories}`;
    }
}