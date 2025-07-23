function greeting() {
    console.log(`Hello world!`);
}
greeting()

function myLength<T>(array: T[]): number {
    let count = 0;
    for (const _ of array) {
        count++;
    }
    return count;
}

function max(data: number[]) {
    let max = data[0]
    // เรียกใช้ฟังก์ชัน myLength() ที่คุณสร้างขึ้นมาแทน built-in property .length
    for (let i = 1; i < myLength(data); i++) {
        if (data[i] > max) {
            max = data[i]
        }
    }
    return max
}
console.log(max([112, 2, 3, 4, 5, 6, 7, 8, 9, 10]))

function factorial(n: number): number {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
console.log(factorial(5));
