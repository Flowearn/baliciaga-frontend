import { test, expect } from '@playwright/test';
import { join } from 'path';

test.describe('Photo Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:8085/login');
    await page.fill('input[name="username"]', 'troyaxjl@gmail.com');
    await page.fill('input[name="password"]', 'Zhehkd.12351');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.goto('http://localhost:8085/create-listing');
    await page.waitForLoadState('networkidle');
  });

  test('1. Initial State Test - No error message on page load', async ({ page }) => {
    // Check that no error message is visible initially
    const errorMessage = page.locator('text=At least one photo is required.');
    await expect(errorMessage).not.toBeVisible();
    
    // Verify the Property Photos title has a red asterisk
    const photoTitle = page.locator('h3:has-text("Property Photos")');
    await expect(photoTitle).toBeVisible();
    
    const redAsterisk = page.locator('h3:has-text("Property Photos") span.text-red-500');
    await expect(redAsterisk).toBeVisible();
    
    console.log('✓ Initial state test passed: No error message visible, red asterisk present');
  });

  test('2. Error Display Test - Error appears when publishing without photos', async ({ page }) => {
    // Fill in minimal required fields
    await page.fill('input[id="title"]', 'Test Property');
    await page.fill('input[id="address"]', '123 Test Street');
    await page.fill('input[id="monthlyRent"]', '5000000');
    
    // Select poster role
    await page.click('button:has-text("Tenant")');
    
    // Select lease duration
    await page.click('button:has-text("6 months")');
    
    // Scroll to and click publish button without uploading photos
    await page.locator('button:has-text("Publish Listing")').scrollIntoViewIfNeeded();
    await page.click('button:has-text("Publish Listing")');
    
    // Wait for error message to appear
    await page.waitForSelector('text=At least one photo is required.', { timeout: 5000 });
    
    // Verify error message is visible
    const errorMessage = page.locator('text=At least one photo is required.');
    await expect(errorMessage).toBeVisible();
    
    // Verify error message has correct styling (red text)
    const errorElement = page.locator('p:has-text("At least one photo is required.")');
    await expect(errorElement).toHaveClass(/text-red-500/);
    
    console.log('✓ Error display test passed: Error message appears with correct styling');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: '/Users/troy/开发文档/Baliciaga/frontend/tests/screenshots/photo-error-state.png',
      fullPage: true 
    });
  });

  test('3. Error Clearing Test - Error disappears after uploading photo', async ({ page }) => {
    // Fill in minimal required fields
    await page.fill('input[id="title"]', 'Test Property');
    await page.fill('input[id="address"]', '123 Test Street');
    await page.fill('input[id="monthlyRent"]', '5000000');
    
    // Select poster role
    await page.click('button:has-text("Tenant")');
    
    // Select lease duration
    await page.click('button:has-text("6 months")');
    
    // First trigger the error by clicking publish
    await page.locator('button:has-text("Publish Listing")').scrollIntoViewIfNeeded();
    await page.click('button:has-text("Publish Listing")');
    
    // Wait for error message to appear
    await page.waitForSelector('text=At least one photo is required.', { timeout: 5000 });
    
    // Verify error is visible
    const errorMessage = page.locator('text=At least one photo is required.');
    await expect(errorMessage).toBeVisible();
    
    // Create a test image file
    const testImagePath = join(__dirname, 'test-image.png');
    
    // Upload a photo
    const uploadButton = page.locator('button:has-text("Upload")');
    await uploadButton.scrollIntoViewIfNeeded();
    
    // Click the upload button to trigger file input
    await uploadButton.click();
    
    // Set files on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait a moment for the upload to process
    await page.waitForTimeout(1000);
    
    // Verify error message disappears
    await expect(errorMessage).not.toBeVisible();
    
    console.log('✓ Error clearing test passed: Error message disappears after photo upload');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: '/Users/troy/开发文档/Baliciaga/frontend/tests/screenshots/photo-error-cleared.png',
      fullPage: true 
    });
  });

  test('4. Visual Elements Test - Verify red asterisk styling', async ({ page }) => {
    // Locate the Property Photos title
    const photoTitle = page.locator('h3:has-text("Property Photos")');
    await expect(photoTitle).toBeVisible();
    
    // Verify the red asterisk exists and has correct styling
    const redAsterisk = photoTitle.locator('span.text-red-500.ml-1');
    await expect(redAsterisk).toBeVisible();
    await expect(redAsterisk).toHaveText('*');
    
    // Verify the asterisk has the correct CSS classes
    await expect(redAsterisk).toHaveClass(/text-red-500/);
    await expect(redAsterisk).toHaveClass(/ml-1/);
    
    console.log('✓ Visual elements test passed: Red asterisk has correct styling');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: '/Users/troy/开发文档/Baliciaga/frontend/tests/screenshots/photo-title-asterisk.png',
      fullPage: true 
    });
  });
});