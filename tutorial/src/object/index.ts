import { Car2,Person2 } from "../interface/interface"

// How to write object in Typescript

// This normalize declaration variable

let car1: string = "Fiat"

// let's do it create object 

const car2: Car2 = {
    type: "Fiat",
    model: "500",
    color: "white"
}

// Using the new keyword

const person1 = new Object({
    name: "John",
    age: 30
})

const person2:Person2 ={
    name:"TaiChi",
    age:30,
    display(name:string,age:number){
        console.log(`My name is ${name} and I am ${age} years old.`);
    }
}

// This part of export variable to other foler & file parttern export multiple value
export { car1, car2, person1, person2 }