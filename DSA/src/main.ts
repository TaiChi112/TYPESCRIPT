interface fieldPointA {
    x: number;
    y: number;
}
class PointA {
    field: fieldPointA;
    constructor(x: number, y: number) {
        this.field = { x, y };
    }
    display(): void {
        console.log(`x: ${this.field.x}, y: ${this.field.y}`);
    }
}
interface IStack{
    stack: number[];
    capacity: number;
    top: number;
    push(value: number): void;
    pop(): number;
    display(): void;
}
class Stack implements IStack{
    stack: number[];
    capacity: number;
    top: number;
    constructor(capacity: number) {
        this.stack = [];
        this.capacity = capacity;
        this.top = -1;
    }
    push(value: number): void {
        if (this.top === this.capacity - 1) {
            console.log("Stack Overflow");
        } else {
            this.top++;
            this.stack[this.top] = value;
        }
    }
    pop(): number {
        if (this.top === -1) {
            console.log("Stack Underflow");
            return -1;
        } else {
            let value: number = this.stack[this.top];
            this.top--;
            return value;
        }
    }
    display(): void {
        for (let i: number = 0; i <= this.top; i++) {
            console.log(this.stack[i]);
        }
    }
}
function main(): Number {
    let p1: PointA = new PointA(10, 20);
    p1.display();

    let stack: Stack = new Stack(5);
    stack.push(10);
    stack.push(20);
    stack.push(30);
    stack.push(40);
    stack.push(50);
    stack.display();
    console.log();
    stack.pop();
    stack.display();
    return 0;
}
main();