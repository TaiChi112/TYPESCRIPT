import { User } from "../models/Others/User";
import { Account } from "../models/Others/Account"
import { Browser } from "../models/Others/Browser";
import { Animal } from "../models/Others/Animal";
import { Food } from "../models/Others/Food";

const test_user = (): void => {
    const user1 = new User(1, "Alice");
    const user2 = new User(2, "Bob");
    console.log(user1.show_info_user());
    console.log(user2.show_info_user());
}
const test_account = (): void => {
    const account1 = new Account(1, new User(1, "Alice"), 1000);
    const account2 = new Account(2, new User(2, "Bob"), 2000);
    const account3 = new Account(3, new User(3, "Charlie"), 3000);
    console.log(account1.show_info_account());
    console.log(account2.show_info_account());
    console.log(account3.show_info_account());
}
const test_browser = (): void => {
    const browser1 = new Browser("Chrome", "1.0.0", "https://www.google.com/chrome/");
    const browser2 = new Browser("Firefox", "1.0.0", "https://www.mozilla.org/firefox/");
    console.log(browser1.show_info_browser());
    console.log(browser2.show_info_browser());
}
const test_food = (): void => {
    const food1 = new Food(1, "Apple", 95);
    const food2 = new Food(2, "Banana", 105);
    console.log(food1.show_info_food());
    console.log(food2.show_info_food());
}
const test_animal = (): void => {
    const animal1 = new Animal(1, "Lion");
    const animal2 = new Animal(2, "Tiger");
    console.log(animal1.show_info_animal());
    console.log(animal2.show_info_animal());
}

export { test_user, test_account, test_browser, test_food, test_animal }