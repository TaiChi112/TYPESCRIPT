import { BrowserErrorType } from "../../enum/Youtube/browser";
export interface IBrowserError {
    type: BrowserErrorType;
    message: string;
}