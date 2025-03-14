import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 訪問登錄頁面
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // 檢查登錄表單是否顯示
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // 輸入無效的憑據
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // 檢查錯誤消息 - 注意：可能需要根據實際應用調整錯誤消息文本
    // 使用更寬鬆的選擇器，匹配任何錯誤消息
    await expect(page.locator('.error-message, .alert-error, [role="alert"]')).toBeVisible({ timeout: 3000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // 輸入有效的憑據 (這裡需要使用測試環境中有效的用戶)
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('string');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // 檢查是否成功登錄並重定向到食譜頁面
    await expect(page).toHaveURL('/recipes', { timeout: 5000 });
    
    // 檢查登錄後的元素 - 使用實際頁面上存在的元素
    // 根據頁面快照，登出是一個文本元素，而不是按鈕
    await expect(page.getByText('Logout')).toBeVisible({ timeout: 5000 });
    
    // 檢查用戶名鏈接是否存在
    await expect(page.getByRole('link', { name: 'user1' })).toBeVisible({ timeout: 5000 });
  });
}); 