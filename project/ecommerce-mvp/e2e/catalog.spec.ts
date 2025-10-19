import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test('should display products on catalog page', async ({ page }) => {
    // TODO: Implement test
    // Given: User navigates to catalog page
    // When: Page loads
    // Then: Products are displayed
  });

  test('should navigate to product detail', async ({ page }) => {
    // TODO: Implement test
    // Given: User is on catalog page
    // When: User clicks on a product
    // Then: Product detail page is displayed
  });

  test('should show out of stock message for unavailable products', async ({ page }) => {
    // TODO: Implement test
    // Given: Product with stock = 0
    // When: User views product detail
    // Then: "Out of Stock" message is shown
  });
});
