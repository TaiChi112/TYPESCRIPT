function add_data(data: number, index: number, arr: number[]): number[] {
    if (index < 0 || index > arr.length) {
        throw new Error("Index out of bounds");
    }
    for (let i = arr.length; i > index; i--) {
        arr[i] = arr[i - 1] !== undefined ? arr[i - 1]! : 0;
    }
    arr[index] = data;
    return arr;
}
type MyType = {
    id: number;
    name: string;
};
function add_data_object(data: MyType, id: number, myObject: MyType[]): MyType[] {
    if (id < 0 || id > myObject.length) {
        throw new Error("Index out of bounds");
    }
    for (let i = myObject.length; i > id; i--) {
        myObject[i] = myObject[i - 1]!;
    }
    myObject[id] = data;
    return myObject;
}
class Stack {
    private data: number[] = [];
    private top: number = -1;
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    push(value: number): void {
        if (this.top >= this.capacity - 1) {
            throw new Error("Stack overflow");
        }
        this.data[++this.top] = value;
    }
    pop(): number | undefined {
        if (this.top < 0) {
            throw new Error("Stack underflow");
        }
        return this.data[this.top--];
    }
}
function main(): number {
    let data: number[] = [];
    data.push(1);
    data.push(2);
    data.push(3);
    data.forEach((value: number) => {
        console.log(value);
    });
    console.log();

    add_data(4, 1, data);
    data.forEach((value: number) => {
        console.log(value);
    });


    let myObject: MyType[] = [];
    myObject.push({ id: 1, name: "Alice" });
    myObject.push({ id: 2, name: "Bob" });
    myObject.forEach((item: MyType) => {
        console.log(`ID: ${item.id}, Name: ${item.name}`);
    });

    console.log();
    add_data_object({ id: 3, name: "Charlie" }, 1, myObject);
    myObject.forEach((item: MyType) => {
        console.log(`ID: ${item.id}, Name: ${item.name}`);
    });
    return 0;
}
main();