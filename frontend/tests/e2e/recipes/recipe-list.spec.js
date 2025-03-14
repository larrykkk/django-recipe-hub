import { test, expect } from '@playwright/test';

test.describe('Recipe List functionality', () => {
  // 在每個測試之前先登入
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
  });

  test('should display recipe list', async ({ page }) => {
    // 檢查頁面標題 - 使用更寬鬆的選擇器
    await expect(page.getByRole('heading').filter({ hasText: /recipes/i })).toBeVisible({ timeout: 5000 });
    
    // 等待食譜卡片或列表項加載 - 使用更通用的選擇器，但避免嚴格模式違規
    const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article, h3';
    const recipeElements = page.locator(recipeSelector);
    
    // 檢查是否有至少一個元素 - 正確處理 Promise
    const count = await recipeElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // 確保第一個元素可見
    await expect(recipeElements.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to recipe detail when clicking on a recipe', async ({page}) => {
    // 等待食譜卡片或列表項加載
    const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article, h3';
    const recipeElements = page.locator(recipeSelector);
    
    // 確保有至少一個食譜
    const count = await recipeElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // 直接獲取第一個食譜的標題元素
    const firstRecipeTitle = await page.locator('.recipe-card h3, .recipe-item h3').first().textContent();
    
    // 點擊第一個食譜
    await recipeElements.first().click();
    
    // 等待導航到詳情頁面 - URL 應該包含 /recipes/ 後跟 ID
    await expect(page).toHaveURL(/\/recipes\/\d+/, { timeout: 5000 });
    
    // 檢查詳情頁面是否包含食譜標題
    if (firstRecipeTitle) {
      // 檢查詳情頁面是否包含食譜名稱
      await expect(page.getByText(firstRecipeTitle, { exact: false })).toBeVisible({ timeout: 5000 });
    } else {
      // If we couldn't get the title, just verify we're on a detail page
      await expect(page.locator('.recipe-detail')).toBeVisible({ timeout: 5000 }  );
    }
  });
}); 