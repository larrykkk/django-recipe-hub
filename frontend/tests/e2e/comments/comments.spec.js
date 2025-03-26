import { test, expect } from '@playwright/test';

// 使用 test.describe.configure 來確保測試按順序執行
test.describe.configure({ mode: 'serial' });

test.describe('Comments functionality', () => {
  let commentText;

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

    // 找一個食譜頁面點進去
    const recipeSelector = '.recipe-card, .recipe-item, [data-testid="recipe-item"], article, h3';
    const recipeElements = page.locator(recipeSelector);
    await recipeElements.first().click();

    // 等待詳情頁面加載
    await expect(page.locator('.recipe-header')).toBeVisible({ timeout: 5000 });
  });

  test('should add a new comment', async ({ page }) => {
    // 等待評論輸入框加載 - 使用更寬鬆的選擇器
    const commentInputSelector = 'textarea[placeholder*="comment" i], input[placeholder*="comment" i], [aria-label*="comment" i], textarea, form input[type="text"]';
    const commentInput = page.locator(commentInputSelector).first();
    
    // 如果找不到評論輸入框，可能需要等待更長時間或刷新頁面
    if (!(await commentInput.isVisible({ timeout: 3000 }))) {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    
    // 添加評論
    commentText = `Test comment ${Date.now()}`;
    await commentInput.fill(commentText);
    
    // 點擊提交按鈕 - 使用更寬鬆的選擇器
    const submitSelector = 'button:has-text("Submit"), button:has-text("Add"), button:has-text("Post"), input[type="submit"], button[type="submit"]';
    await page.locator(submitSelector).first().click();
    
    // 檢查評論是否已添加 - 使用更寬鬆的檢查
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing comment', async ({ page }) => {
    // 先添加一個新評論，確保有自己的評論可以編輯
    const commentInputSelector = 'textarea[placeholder*="comment" i], input[placeholder*="comment" i], [aria-label*="comment" i], textarea, form input[type="text"]';
    const commentInput = page.locator(commentInputSelector).first();
    
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    
    // 添加評論
    const newCommentText = `Test comment for edit ${Date.now()}`;
    await commentInput.fill(newCommentText);
    
    // 點擊提交按鈕
    const submitSelector = 'button:has-text("Submit"), button:has-text("Add"), button:has-text("Post"), input[type="submit"], button[type="submit"]';
    await page.locator(submitSelector).first().click();
    
    // 檢查評論是否已添加
    await expect(page.getByText(newCommentText)).toBeVisible({ timeout: 10000 });
    
    // 等待一下，確保評論已完全加載
    await page.waitForTimeout(1000);
    
    // 使用更可靠的方法找到編輯按鈕
    // 1. 找到包含評論文本的元素
    const commentElement = page.getByText(newCommentText).first();
    
    // 2. 向上查找到 .comment-item 元素
    const commentItem = commentElement.locator('xpath=ancestor::div[contains(@class, "comment-item")]');
    
    // 3. 在評論項中查找編輯按鈕
    const editButton = commentItem.getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible({ timeout: 5000 });
    
    // 4. 點擊編輯按鈕
    await editButton.click();
    
    // 5. 等待編輯表單出現
    // 注意：點擊編輯按鈕後，原始評論內容會被隱藏，編輯表單會顯示
    await page.waitForTimeout(1000);
    
    // 6. 直接在頁面上查找文本框，而不是在特定評論項中查找
    const textarea = page.locator('.comment-item.own-comment textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    
    // 7. 修改評論內容
    const editedCommentText = `Edited comment ${Date.now()}`;
    await textarea.fill(editedCommentText);
    
    // 8. 點擊保存按鈕 - 使用更可靠的選擇器
    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();
    
    // 9. 檢查評論是否已更新
    await expect(page.getByText(editedCommentText)).toBeVisible({ timeout: 5000 });
    
    // 10. 更新 commentText 變量，以便後續測試使用
    commentText = editedCommentText;
  });

  test('should delete a comment', async ({ page }) => {
    // 確保有評論可以刪除
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 5000 });
    
    // 找到自己的評論項 - 尋找包含 "(You)" 標記的評論
    const ownCommentItem = page.locator('.comment-item.own-comment').filter({ hasText: commentText });
    
    // 點擊刪除按鈕
    await ownCommentItem.locator('button.delete-btn').click();
    
    // 等待確認刪除按鈕出現
    await expect(ownCommentItem.locator('button.delete-btn.confirm-delete')).toBeVisible({ timeout: 5000 });
    
    // 點擊確認刪除按鈕
    await ownCommentItem.locator('button.delete-btn.confirm-delete').click();
    
    // 檢查評論是否已刪除
    await expect(page.getByText(commentText)).not.toBeVisible({ timeout: 10000 });
  });

  // 簡化測試，只測試基本功能
  test('should handle encoded_id correctly in comments', async ({ page }) => {
    // 添加一個新評論用於測試
    const commentInputSelector = 'textarea[placeholder*="comment" i], input[placeholder*="comment" i], [aria-label*="comment" i], textarea, form input[type="text"]';
    const commentInput = page.locator(commentInputSelector).first();
    
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    
    // 添加評論
    const newCommentText = `Encoded ID test comment ${Date.now()}`;
    await commentInput.fill(newCommentText);
    
    // 點擊提交按鈕
    const submitSelector = 'button:has-text("Submit"), button:has-text("Add"), button:has-text("Post"), input[type="submit"], button[type="submit"]';
    await page.locator(submitSelector).first().click();
    
    // 檢查評論是否已添加
    await expect(page.getByText(newCommentText)).toBeVisible({ timeout: 10000 });
    
    // 刷新頁面，檢查評論是否仍然存在（驗證 encoded_id 處理正確）
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(newCommentText)).toBeVisible({ timeout: 5000 });
  });
}); 