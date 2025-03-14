# 食譜應用端到端測試

本目錄包含使用 Playwright 框架編寫的端到端 (E2E) 測試。

## 測試結構

測試按功能區域組織：

- `auth/` - 用戶認證相關測試
- `recipes/` - 食譜列表和詳情頁面測試
- `comments/` - 評論功能測試
- `helpers.js` - 共享測試助手函數

## 運行測試

### 前提條件

- Node.js 16+
- npm 或 yarn

### 安裝依賴

如果尚未安裝 Playwright，請運行：

```bash
npm install -D @playwright/test
npx playwright install
```

### 運行所有測試

```bash
npx playwright test
```

### 運行特定測試文件

```bash
npx playwright test tests/e2e/auth/login.spec.js
```

### 在 UI 模式下運行測試

```bash
npx playwright test --ui
```

### 生成測試報告

```bash
npx playwright test --reporter=html
npx playwright show-report
```

## 測試用戶

測試使用以下測試用戶：

- 電子郵件: `user@example.com`
- 密碼: `string`

**注意：** 在運行測試之前，請確保測試用戶在系統中存在，或者修改測試文件中的憑據以匹配您的測試環境。

## 調整測試選擇器

測試中使用的選擇器（如 `.recipe-card`、`.edit-button` 等）可能需要根據實際應用的 HTML 結構進行調整。如果測試失敗，請檢查選擇器是否與應用的 DOM 結構匹配。

## 測試適配指南

當前測試是基於假設的應用結構編寫的，在實際運行前需要進行以下調整：

1. **選擇器調整**：根據實際 DOM 結構修改選擇器，例如 `.recipe-card`、`.edit-button` 等。
2. **錯誤消息驗證**：確認實際應用中的錯誤消息文本，例如 `Invalid credentials`。
3. **頁面導航**：確認實際應用中的頁面導航路徑和 URL 結構。
4. **按鈕和表單元素**：確認實際應用中的按鈕文本和表單元素標籤。

## 故障排除

如果測試失敗，可以嘗試以下步驟：

1. 使用 `--debug` 標誌運行測試以查看瀏覽器操作：

   ```bash
   npx playwright test --debug
   ```
2. 檢查測試報告中的截圖和跟踪：

   ```bash
   npx playwright test --reporter=html
   npx playwright show-report
   ```
3. 調整測試中的超時值，如果應用加載較慢：

   ```javascript
   // 增加等待時間
   await page.waitForSelector('.recipe-card', { timeout: 10000 });
   ```
4. 使用 Playwright 的 Codegen 工具生成更準確的選擇器：

   ```bash
   npx playwright codegen http://localhost:5173
   ```
