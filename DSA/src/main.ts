import { Array } from "./class/array"
import { LinkList } from "./class/linkList";

let myArray = new Array()
let myLinkList = new LinkList()
let myArray1: number[] = [112, 1121];

myArray1 = myArray.addData(myArray1, 3)
console.log(myArray.getData(myArray1));
myArray1 = myArray.updateData(myArray1, 0, 9)
console.log(myArray.getData(myArray1));
myArray1 = myArray.deleteData(myArray1,1)
console.log(myArray.getData(myArray1));







// myArray = addData(myArray, 2);
// myArray = addData(myArray, 1);
// console.log(getData(myArray));

// myArray = updateData(myArray, 0, 8);
// console.log(getData(myArray));

// myArray = deleteData(myArray, 1);
// console.log(getData(myArray));



