import type { IBrowser } from "./interface/IBrowser";
import { BrowserErrorType } from "../../enum/Youtube/browser";
import type { IBrowserError } from "../../interfaces/Youtube/browser";
import { type Result, ok, err } from "../../types/Youtube/result";

export class Browser implements IBrowser {
    private name: string;
    private url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }

    get_browser_name(): string {
        return this.name;
    }

    get_browser_url(): string {
        return this.url;
    }

    set_browser_name(name: string): Result<void, IBrowserError> {
        if (!name || name.trim() === "") {
            return err({
                type: BrowserErrorType.Invalid_Name,
                message: "Browser name cannot be empty."
            });
        }
        this.name = name;
        return ok(undefined);
    }

    set_browser_url(url: string): Result<void, IBrowserError> {
        if (!url || !/^https?:\/\//.test(url)) {
            return err({
                type: BrowserErrorType.Invalid_URL,
                message: "Browser URL must start with http:// or https://."
            });
        }
        this.url = url;
        return ok(undefined);
    }

    show_info_browser(): string {
        return `Browser Name: ${this.name}, URL: ${this.url}`;
    }
}