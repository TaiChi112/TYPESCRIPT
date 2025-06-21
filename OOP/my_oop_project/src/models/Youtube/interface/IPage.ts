import type { IPageError } from "../../../interfaces/Youtube/page";
import { type Result } from "../../../types/Youtube/result";
export interface IPage {
    set_page_width(width: number): Result<void, IPageError>;
    set_page_height(height: number): Result<void, IPageError>;
    show_info_page(): string;
    get_page_width(): number;
    get_page_height(): number;
}