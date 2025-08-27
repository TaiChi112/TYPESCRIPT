
import { test_user, test_account, test_browser, test_food, test_animal } from "../utils/test";
import { space } from "../utils/tools";
const terminal = (): void => {
    let choice: string;
    do {
        console.log("1. Show User Info");
        console.log("2. Show Account Info");
        console.log("3. Show Browser Info");
        console.log("4. Show Food Info");
        console.log("5. Show Animal Info");
        console.log("0. Exit");
        choice = prompt("Enter your choice: ") || "0";

        switch (choice) {
            case "1":
                space();
                test_user();
                space();
                break;
            case "2":
                space();
                test_account();
                space();
                break;

            case "3":
                space();
                test_browser();
                space();
                break;
            case "4":
                space();
                test_food();
                space();
                break;
            case "5":
                space();
                test_animal();
                space();
                break;
            default:
                console.log("Invalid choice, please try again.");
        }
    } while (choice !== "0");
}
export default terminal;