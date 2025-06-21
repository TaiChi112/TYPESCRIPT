// src/__tests__/Page.test.ts
import { Page } from '../../../src/models/Youtube/Page';
import { PageErrorType } from '../../../src/enum/Youtube/page';
describe('Page Class', () => {
  let page: Page;

  beforeEach(() => {
    page = new Page(100, 200);
  });

  it('should initialize with correct width and height', () => {
    expect(page.get_page_width()).toBe(100);
    expect(page.get_page_height()).toBe(200);
  });

  it('should initialize correctly with zero dimensions', () => {
    const zeroPage = new Page(0, 0);
    expect(zeroPage.get_page_width()).toBe(0);
    expect(zeroPage.get_page_height()).toBe(0);
  });

  it('should throw an error if initialized with negative dimensions', () => {
    expect(() => new Page(-10, 20)).toThrow(PageErrorType.Negative_Dimension + ": Page dimensions cannot be negative.");
    expect(() => new Page(10, -20)).toThrow(PageErrorType.Negative_Dimension + ": Page dimensions cannot be negative.");
    expect(() => new Page(-10, -20)).toThrow(PageErrorType.Negative_Dimension + ": Page dimensions cannot be negative.");
  });



  it('should return an Err result when setting a negative page width', () => {
    const result = page.set_page_width(-50);

    if (result.ok === false) {
      expect(result.error).toEqual({
        type: PageErrorType.Negative_Dimension,
        message: "Page width cannot be negative."
      });
    } else {
      fail('Expected set_page_width to return an Err result, but it returned Ok.');
    }

    expect(page.get_page_width()).toBe(100);
  });

  it('should update the page height correctly and return an Ok result', () => {
    const result = page.set_page_height(250);
    expect(result.ok).toBe(true);
    expect(page.get_page_height()).toBe(250);
  });

  it('should return an Err result when setting a negative page height', () => {
    const result = page.set_page_height(-50);

    if (result.ok === false) {
      expect(result.error).toEqual({
        type: PageErrorType.Negative_Dimension,
        message: "Page height cannot be negative."
      });
    } else {
      fail('Expected set_page_height to return an Err result, but it returned Ok.');
    }

    expect(page.get_page_height()).toBe(200);
  });


  it('should return the correct page information string', () => {
    expect(page.show_info_page()).toBe('Page width: 100, height: 200');

    page.set_page_width(500);
    page.set_page_height(800);
    expect(page.show_info_page()).toBe('Page width: 500, height: 800');
  });
});