enum EROLE{
    CUSTOMER = 'CUSTOMER',
    COMPANY = 'COMPANY',
}

const role:EROLE = EROLE.CUSTOMER;

const myObject = {
    name:"John Doe",
    age: 30,
    city:"New York",
}
type MyObjectKeys = keyof typeof myObject;

function getObjectValue<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
const _name = getObjectValue(myObject, "name");
const _age = getObjectValue(myObject, "age");
const _city = getObjectValue(myObject, "city");


