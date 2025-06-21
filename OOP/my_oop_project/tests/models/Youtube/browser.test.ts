import { Browser } from '../../../src/models/Youtube/browser';
import { BrowserErrorType } from '../../../src/enum/Youtube/browser';

describe('Browser Class', () => {
    let browser: Browser;

    beforeEach(() => {
        browser = new Browser('Chrome', 'https://www.google.com');
    });

    it('should initialize with correct name and url', () => {
        expect(browser.get_browser_name()).toBe('Chrome');
        expect(browser.get_browser_url()).toBe('https://www.google.com');
    });

    it('should update the browser name correctly and return an Ok result', () => {
        const result = browser.set_browser_name('Firefox');
        expect(result.ok).toBe(true);
        expect(browser.get_browser_name()).toBe('Firefox');
    });

    it('should return an Err result when setting an empty browser name', () => {
        const result = browser.set_browser_name('');
        if (result.ok === false) {
            expect(result.error).toEqual({
                type: BrowserErrorType.Invalid_Name,
                message: "Browser name cannot be empty."
            });
        } else {
            fail('Expected set_browser_name to return an Err result, but it returned Ok.');
        }
        expect(browser.get_browser_name()).toBe('Chrome');
    });

    it('should update the browser url correctly and return an Ok result', () => {
        const result = browser.set_browser_url('https://www.mozilla.org');
        expect(result.ok).toBe(true);
        expect(browser.get_browser_url()).toBe('https://www.mozilla.org');
    });

    it('should return an Err result when setting an invalid browser url', () => {
        const result = browser.set_browser_url('ftp://invalid-url');
        if (result.ok === false) {
            expect(result.error).toEqual({
                type: BrowserErrorType.Invalid_URL,
                message: "Browser URL must start with http:// or https://."
            });
        } else {
            fail('Expected set_browser_url to return an Err result, but it returned Ok.');
        }
        expect(browser.get_browser_url()).toBe('https://www.google.com');
    });

    it('should return the correct browser information string', () => {
        expect(browser.show_info_browser()).toBe('Browser Name: Chrome, URL: https://www.google.com');
        browser.set_browser_name('Edge');
        browser.set_browser_url('https://www.microsoft.com');
        expect(browser.show_info_browser()).toBe('Browser Name: Edge, URL: https://www.microsoft.com');
    });
});