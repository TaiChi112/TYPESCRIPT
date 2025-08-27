import type { Result } from "../../../types/Youtube/result";
import type { IBrowserError } from "../../../interfaces/Youtube/browser";

export interface IBrowser {
    get_browser_name(): string;
    get_browser_url(): string;
    set_browser_name(name: string): Result<void, IBrowserError>;
    set_browser_url(url: string): Result<void, IBrowserError>;
    show_info_browser(): string;
}