import type { IPage } from "../interface/IPage";
import { PageErrorType } from "../../enum/Youtube/page";
import { type IPageError } from "../../interfaces/Youtube/page";
import { ok, err, type Result } from "../../types/Youtube/result";

export class Page implements IPage {
    private width: number;
    private height: number;

    constructor(width: number, height: number) {
        if (width < 0 || height < 0) {
            throw new Error(PageErrorType.Negative_Dimension + ": Page dimensions cannot be negative.");
        }
        this.width = width;
        this.height = height;
    }
    set_page_width(width: number): Result<void, IPageError> {
        if(width < 0) {
            return err({
                type: PageErrorType.Negative_Dimension,
                message: "Page width cannot be negative."
            });
        }
        this.width = width;
        return ok(undefined);
    }
    set_page_height(height: number): Result<void, IPageError> {
        if (height < 0) {
            return err({
                type: PageErrorType.Negative_Dimension,
                message: "Page height cannot be negative."
            });
        }
        this.height = height;
        return ok(undefined);
    }
    show_info_page(): string {
        return `Page width: ${this.width}, height: ${this.height}`;
    }
    get_page_width(): number {
        return this.width;
    }
    get_page_height(): number {
        return this.height;
    }
}