import { User } from "../Others/User";

export class Account extends User {
    private account_id: number;
    private balance: number;

    constructor(account_id: number, user: User, balance: number) {
        super(user.get_id(), user.get_name());
        this.account_id = account_id;
        this.balance = balance;
    }

    show_info_account(): string {
        return `Account ID: ${this.get_id()}, Name: ${this.get_name()}, Balance: ${this.get_balance()}`;
    }

    get_balance(): number {
        return this.balance;
    }

    set_balance(new_balance: number): void {
        this.balance = new_balance;
    }

}