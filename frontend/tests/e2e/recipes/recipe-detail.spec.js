import { test, expect } from '@playwright/test';

test.describe('Recipe Detail functionality', () => {
  let recipeId;

  test.beforeEach(async ({ page }) => {
    // 先登入
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('string');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // 等待登入成功並重定向
    await expect(page).toHaveURL('/recipes', { timeout: 5000 });
    
    // 確認已登入
    await expect(page.getByText('Logout')).toBeVisible({ timeout: 5000 });
    
    // 等待食譜卡片加載
    const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article, h3';
    const recipeElements = page.locator(recipeSelector);
    
    // 檢查是否有至少一個元素 - 正確處理 Promise
    const count = await recipeElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // 確保第一個元素可見
    await expect(recipeElements.first()).toBeVisible({ timeout: 5000 });
    
    // 點擊第一個食譜卡片
    await recipeElements.first().click();
    
    // 獲取當前 URL 中的食譜 ID
    const url = page.url();
    recipeId = url.split('/').pop();
    
    // 確保我們在食譜詳情頁面
    await expect(page).toHaveURL(/\/recipes\/[a-zA-Z0-9]+/);
  });

  test('should display comments section', async ({ page }) => {
    // 檢查評論區域是否存在
    await expect(page.locator('.comment-input')).toBeVisible({ timeout: 3000 });
  });

  test('should allow adding a comment when logged in', async ({ page }) => {
    // 已經在 beforeEach 中登入了
    
    // 等待評論輸入框加載 - 使用更寬鬆的選擇器
    const commentInputSelector = 'textarea[placeholder*="comment" i], input[placeholder*="comment" i], [aria-label*="comment" i], textarea, form input[type="text"]';
    const commentInput = page.locator(commentInputSelector).first();
    await expect(commentInput).toBeVisible({ timeout: 3000 });
    
    // 添加評論
    const commentText = `Test comment ${Date.now()}`;
    await commentInput.fill(commentText);
    
    // 點擊提交按鈕 - 使用更寬鬆的選擇器
    const submitSelector = 'button:has-text("Submit"), button:has-text("Add"), button:has-text("Post"), input[type="submit"], button[type="submit"]';
    await page.locator(submitSelector).first().click();
    
    // 檢查評論是否已添加
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 5000 });
  });

  test('should not allow adding a comment when not logged in', async ({ page }) => {
    // 登出
    const logoutSelector = '.navbar-item.logout-button';
    if (await page.locator(logoutSelector).isVisible()) {
      await page.locator(logoutSelector).first().click();
      // 等待登出完成
      await page.waitForTimeout(1000);
    }
    
    // 直接訪問食譜詳情頁面
    await page.goto(`/recipes/${recipeId}`);
    
    // 檢查是否被重定向到登入頁面
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
}); 