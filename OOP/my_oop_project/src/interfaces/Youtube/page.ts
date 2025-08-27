import { PageErrorType } from "../../enum/Youtube/page";
export interface IPageError{
    type: PageErrorType;
    message: string;
}