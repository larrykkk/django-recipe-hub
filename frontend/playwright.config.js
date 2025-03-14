// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* 每次測試的最大超時時間 */
  timeout: 30000,
  /* 每個動作的超時時間 */
  expect: {
    /**
     * 斷言的最大超時時間
     * @see https://playwright.dev/docs/test-assertions
     */
    timeout: 10000
  },
  /* 測試運行器的配置 */
  fullyParallel: false,
  /* 失敗時重試次數 */
  retries: 1,
  /* 並行運行的工作數 */
  workers: 1,
  /* 測試報告 */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  /* 共享設置 */
  use: {
    /* 基本 URL */
    baseURL: 'http://localhost:5173',
    /* 自動截圖 */
    screenshot: 'only-on-failure',
    /* 收集跟踪信息 */
    trace: 'on-first-retry',
    /* 視頻錄製 */
    video: 'on-first-retry',
    /* 頁面加載超時 */
    navigationTimeout: 15000,
    /* 啟用 JavaScript */
    javaScriptEnabled: true,
    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,
  },

  /* 項目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* 本地開發服務器配置 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
}); 