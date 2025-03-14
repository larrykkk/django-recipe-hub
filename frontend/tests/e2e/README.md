# 端到端 (E2E) 測試

本目錄包含使用 Playwright 框架編寫的端到端測試。

## 測試結構

測試按功能模塊組織：

- `auth/` - 用戶認證相關測試
- `recipes/` - 食譜功能相關測試
- `comments/` - 評論功能相關測試
- `helpers.js` - 通用測試輔助函數

## 運行測試

### 前提條件

- 確保後端 API 服務正在運行
- 確保前端開發服務器已啟動（或使用 webServer 配置自動啟動）

### 運行所有測試

```bash
# 在 frontend 目錄下運行
npx playwright test
```

### 運行特定測試文件

```bash
# 運行特定測試文件
npx playwright test tests/e2e/auth/login.spec.js
```

### 在特定瀏覽器中運行測試

```bash
# 僅在 Chrome 中運行測試
npx playwright test --project=chromium
```

### 運行測試並查看報告

```bash
# 運行測試並生成 HTML 報告
npx playwright test --reporter=html

# 查看報告
npx playwright show-report
```

## 調試測試

### 使用 UI 模式

```bash
# 使用 UI 模式運行測試
npx playwright test --ui
```

### 使用 Debug 模式

```bash
# 使用 Debug 模式運行測試
npx playwright test --debug
```

### 生成代碼

```bash
# 使用 Codegen 工具生成測試代碼
npx playwright codegen http://localhost:5173
```

## 測試最佳實踐

1. **使用輔助函數**：重複的操作（如登入）應使用 `helpers.js` 中的函數
2. **使用靈活的選擇器**：避免使用過於具體的選擇器，使用多個備選選擇器提高測試穩定性
3. **設置適當的超時**：對於需要等待的操作，設置合理的超時時間
4. **測試數據隔離**：每個測試應使用獨立的測試數據，避免測試間的依賴
5. **錯誤處理**：添加適當的錯誤處理和恢復機制，提高測試穩定性

## 常見問題解決

### 選擇器問題

如果測試因為找不到元素而失敗，可以：

- 使用更靈活的選擇器（如 `button:has-text("Login"), [aria-label="Login"]`）
- 增加等待時間
- 檢查頁面結構是否發生變化

### 超時問題

如果測試因為超時而失敗，可以：

- 在 `playwright.config.js` 中增加全局超時設置
- 在特定操作中增加超時參數
- 檢查應用性能問題

### 認證問題

如果測試因為認證問題而失敗，可以：

- 確保使用正確的認證信息
- 使用 `storageState` 保存和重用認證狀態
- 檢查認證流程是否發生變化
