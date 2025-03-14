/**
 * E2E 測試的通用輔助函數
 */

/**
 * 登入用戶
 * @param {import('@playwright/test').Page} page - Playwright 頁面對象
 * @param {string} email - 用戶電子郵件
 * @param {string} password - 用戶密碼
 * @returns {Promise<void>}
 */
export async function login(page, email = 'user@example.com', password = 'string') {
  // 導航到登入頁面
  await page.goto('/login');
  
  // 填寫登入表單
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  
  // 點擊登入按鈕
  await page.getByRole('button', { name: 'Login' }).click();
  
  // 等待登入成功並重定向到食譜頁面
  await page.waitForURL('/recipes', { timeout: 5000 });
  
  // 確保登出按鈕可見，表示已成功登入
  await page.waitForSelector('button:has-text("Logout"), a:has-text("Logout")', { timeout: 5000 });
}

/**
 * 登出用戶
 * @param {import('@playwright/test').Page} page - Playwright 頁面對象
 * @returns {Promise<void>}
 */
export async function logout(page) {
  // 點擊登出按鈕
  await page.locator('button:has-text("Logout"), a:has-text("Logout")').first().click();
  
  // 等待重定向到登入頁面
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * 導航到食譜列表頁面並等待加載完成
 * @param {import('@playwright/test').Page} page - Playwright 頁面對象
 * @returns {Promise<void>}
 */
export async function navigateToRecipeList(page) {
  await page.goto('/recipes');
  
  // 等待食譜卡片加載
  const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article, h3';
  const recipeElements = page.locator(recipeSelector);
  
  // 檢查是否有至少一個元素
  await page.waitForFunction(
    selector => document.querySelectorAll(selector).length > 0,
    recipeSelector,
    { timeout: 5000 }
  );
  
  // 確保第一個元素可見
  await recipeElements.first().waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * 添加評論到食譜
 * @param {import('@playwright/test').Page} page - Playwright 頁面對象
 * @param {string} commentText - 評論文本
 * @returns {Promise<void>}
 */
export async function addComment(page, commentText) {
  // 等待評論輸入框加載
  const commentInputSelector = 'textarea[placeholder*="comment" i], input[placeholder*="comment" i], [aria-label*="comment" i], textarea, form input[type="text"]';
  const commentInput = page.locator(commentInputSelector).first();
  
  // 如果找不到評論輸入框，可能需要等待更長時間或刷新頁面
  if (!(await commentInput.isVisible({ timeout: 3000 }))) {
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
  
  await commentInput.waitFor({ state: 'visible', timeout: 5000 });
  
  // 添加評論
  await commentInput.fill(commentText);
  
  // 點擊提交按鈕
  const submitSelector = 'button:has-text("Submit"), button:has-text("Add"), button:has-text("Post"), input[type="submit"], button[type="submit"]';
  await page.locator(submitSelector).first().click();
  
  // 等待評論出現
  await page.waitForSelector(`text="${commentText}"`, { timeout: 10000 });
}

/**
 * 導航到第一個食譜的詳情頁面
 * @param {import('@playwright/test').Page} page - Playwright 頁面對象
 * @returns {Promise<string>} 食譜 ID
 */
export async function navigateToFirstRecipeDetail(page) {
  // 訪問食譜列表頁面
  await page.goto('/recipes');
  
  // 等待食譜卡片加載
  const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article';
  const recipeElements = page.locator(recipeSelector);
  
  // 檢查是否有至少一個元素
  await page.waitForFunction(
    selector => document.querySelectorAll(selector).length > 0,
    recipeSelector,
    { timeout: 5000 }
  );
  
  // 點擊第一個食譜卡片
  await recipeElements.first().click();
  
  // 獲取當前 URL 中的食譜 ID
  const url = page.url();
  const recipeId = url.split('/').pop();
  
  return recipeId;
}

/**
 * 創建測試數據存儲狀態
 * @param {import('@playwright/test').Browser} browser - Playwright 瀏覽器對象
 * @param {string} storageStatePath - 存儲狀態文件路徑
 */
export async function createAuthState(browser, storageStatePath = 'storage-state.json') {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登錄
  await login(page);
  
  // 保存存儲狀態
  await context.storageState({ path: storageStatePath });
  
  await context.close();
} 