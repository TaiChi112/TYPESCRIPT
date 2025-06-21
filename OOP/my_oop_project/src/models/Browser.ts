export class Browser {
    private browser_name: string;
    private version: string;
    private url: string;

    constructor(browser_name: string, version: string, url: string) {
        this.browser_name = browser_name;
        this.version = version;
        this.url = url;
    }

    getUrl(): string {
        return this.url;
    }

    getBrowserName(): string {
        return this.browser_name;
    }

    getVersion(): string {
        return this.version;
    }

    setUrl(newUrl: string): void {
        this.url = newUrl;
    }

    show_info_browser(): string {
        return `Browser Name: ${this.browser_name}, Version: ${this.version}, Current URL: ${this.url}`;
    }
}