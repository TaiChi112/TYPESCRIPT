export class Array {
    data: number[]
    constructor() {
        this.data = []
    }

    addData(array: number[], data: number): number[] {
        return [...array, data]
    }
    getData(array: number[]): number[] {
        return [...array]
    }
    updateData(array: number[], index: number, newData: number): number[] {
        if (index >= 0 && index < array.length) {
            return array.map((array, i) => (i === index ? newData : array));
        } else {
            console.error("Index out of bounds");
            return array
        }
    }
    deleteData(array: number[], index: number): number[] {
        if (index >= 0 && index <= array.length) {
            return array.filter((_, i) => i !== index)
        }
        else {
            console.error("Index out of bounds");
            return array;
        }
    }
}
