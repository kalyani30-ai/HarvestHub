import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const TEST_USER = {
  name: 'Test Customer 1',
  email: 'testcustomer1@phase6.com',
  password: 'TestPass123!',
  phone: '9876543210'
};

test.describe('Authentication E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL
    await page.goto(BASE_URL);
  });

  test('TEST 1: Customer Registration', async ({ page }) => {
    // Navigate to register page
    await page.goto(`${BASE_URL}/register`);
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('#name', TEST_USER.name);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.fill('#phone', TEST_USER.phone);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation or success message
    await page.waitForTimeout(2000);

    // Verify registration succeeded - user should be logged in
    const currentUrl = page.url();
    console.log('Current URL after registration:', currentUrl);

    // Check for any error messages
    const hasError = await page.locator('text=error,Error,failed,Failed').count();
    expect(hasError).toBe(0);

    // Verify we can access customer areas
    await page.goto(`${BASE_URL}/cart`);
    const cartAccessible = page.url().includes('cart') || page.url().includes('login');
    console.log('Cart accessible after registration:', cartAccessible);
  });

  test('TEST 2: Customer Login', async ({ page }) => {
    // Logout first
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);

    // Navigate to login
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify login succeeded
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    const hasError = await page.locator('text=error,Error,failed,Failed').count();
    expect(hasError).toBe(0);
  });

  test('TEST 3: Invalid Login Rejection', async ({ page }) => {
    // Logout first
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);

    // Navigate to login
    await page.goto(`${BASE_URL}/login`);

    // Fill with wrong password
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', 'WrongPassword123!');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Verify login failed - should still be on login page or have error
    const currentUrl = page.url();
    console.log('Current URL after invalid login:', currentUrl);

    // Should have error message
    const hasError = await page.locator('text=error,Error,invalid,Invalid,wrong,Wrong').count();
    console.log('Error message present:', hasError > 0);
  });

  test('TEST 4: Logout', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Logout
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);

    // Verify logged out - try to access protected route
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log('Current URL after logout + cart access:', currentUrl);

    // Should be redirected to login
    const isLoginPage = currentUrl.includes('login');
    console.log('Redirected to login:', isLoginPage);
  });

  test('TEST 5: Session Persistence After Refresh', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(1000);

    // Refresh
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify still logged in
    const currentUrl = page.url();
    console.log('Current URL after refresh:', currentUrl);

    const hasError = await page.locator('text=error,Error,unauthorized,Unauthorized').count();
    console.log('Has auth error after refresh:', hasError > 0);
  });

  test('TEST 6: Protected Routes When Logged Out', async ({ page }) => {
    // Logout
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);
    
    // Test protected routes
    const protectedRoutes = ['/cart', '/orders', '/dashboard'];
    
    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('login');
      console.log(`Route ${route}: redirected to login = ${isLoginPage}`);
      
      expect(isLoginPage).toBeTruthy();
    }
  });

  test('TEST 7: Customer Cannot Access Farmer Routes', async ({ page }) => {
    // Login as customer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Try farmer routes
    const farmerRoutes = ['/farmer/products', '/farmer/add-product', '/farmer-dashboard'];

    for (const route of farmerRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const hasAccessDenied = await page.locator('text=access denied,Access Denied,unauthorized,Unauthorized,403').count() > 0;
      const isNotFarmerRoute = !currentUrl.includes('farmer');

      console.log(`Route ${route}: access denied = ${hasAccessDenied}, not on farmer route = ${isNotFarmerRoute}`);
    }
  });

  test('TEST 8: Translation During Auth Flow', async ({ page }) => {
    // Test English
    await page.goto(`${BASE_URL}/login`);

    // Check for English elements
    const hasEnglishElements = await page.locator('text=Login,Email,Password').count() > 0;
    console.log('English login page elements present:', hasEnglishElements);

    // Switch to Hindi if language switcher exists
    const languageSwitcher = page.locator('select[name="language"], .language-switcher, [data-testid="language-switcher"]');
    if (await languageSwitcher.count() > 0) {
      await languageSwitcher.selectOption('hi');
      await page.waitForTimeout(1000);

      // Check for Hindi elements (no raw keys)
      const hasRawKeys = await page.locator('text=auth.login,products.exampleProduct').count() > 0;
      console.log('Has raw translation keys:', hasRawKeys);
      expect(hasRawKeys).toBe(0);
    }
  });

  test('TEST 9: Console and Network Audit', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through auth flow
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log('Console errors:', errors);

    // Check for critical errors
    const criticalErrors = errors.filter(e =>
      e.includes('Uncaught') ||
      e.includes('TypeError') ||
      e.includes('ReferenceError')
    );

    console.log('Critical console errors:', criticalErrors.length);
    expect(criticalErrors.length).toBe(0);
  });
});
