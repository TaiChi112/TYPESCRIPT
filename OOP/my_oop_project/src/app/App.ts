import { User } from "../models/User";
import { Account } from "../models/Account"
import { space } from "../utils/tools";
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

const App = (): number => {
    let choice: number;
    do {
        console.log("1. Show User Info");
        console.log("2. Show Account Info");
        console.log("3. Exit");
        choice = parseInt(prompt("Enter your choice: ") || "0");

        switch (choice) {
            case 1:
                space();
                test_user();
                space();
                break;
            case 2:
                space();
                test_account();
                space();
                break;
            case 3:
                console.log("Exiting...");
                break;
            default:
                console.log("Invalid choice, please try again.");
        }
    } while (choice !== 3);
    return 0;
}
export default App;