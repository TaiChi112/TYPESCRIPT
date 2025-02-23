// import { car1, car2, person1, person2 } from "./object";

const num_list: number[] = [1, 2, 3, 4, 5, 6]
console.log(...num_list)
console.table(num_list)

interface Person1 {
    name: string
    age: string
}
const Humman: Person1[] = [
    {
        name: 'John',
        age: '30'
    },
    {
        name: 'Jane',
        age: '25'
    },
    {
        name: 'Jim',
        age: '35'
    }
]

console.table(Humman)

interface IUserController{
    
}
class UserController{

}


// Display the content of the object
// console.log(`variable car1 : ${car1}`);
// console.log(`object car2 : ${car2.type} : ${car2.model} : ${car2.color}`);

// console.log(person2.name, person2.age,person2.display(person2.name, person2.age)); 


// import { func } from "./func/func"

// console.log(func(3));

// export function add(a:number, b:number): number {
//     return a + b
// }
// class LLFEComponent {
//     constructor() {
//         console.log('Component initialized');
//         this.onInit();
//     }

//     onInit() {
//         console.log('onInit called');
//     }

//     onDestroy() {
//         console.log('onDestroy called');
//     }
// }

// export default LLFEComponent;
