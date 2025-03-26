Forked by: Course code for: [Build a Backend REST API with Python &amp; Django - Advanced](https://londonapp.dev/c2)

# 專案開發指南

## 環境設定與運行

### 前置需求
- Docker
- Docker Compose

### 本地開發環境啟動

使用 Docker Compose 啟動所有服務（應用程式和資料庫）：
```bash
# 啟動所有服務並查看日誌
docker-compose up

# 在背景執行所有服務
docker-compose up -d

# 停止所有服務
docker-compose down
```

服務啟動後：
- Django 應用程式將運行在 http://localhost:8000
- PostgreSQL 資料庫將運行在 port 5432

## 測試

### 執行單元測試
```bash
# 執行所有單元測試
docker-compose run --rm app sh -c "python manage.py wait_for_db && python manage.py test"
```

### 程式碼品質檢查
```bash
# 執行 flake8 程式碼風格檢查
docker-compose run --rm app sh -c "flake8"
```

## 開發環境配置

### 資料持久化
- 資料庫資料儲存在 `dev-db-data` volume
- 靜態檔案儲存在 `dev-static-data` volume

### 環境變數
開發環境預設值：
- DB_HOST=db
- DB_NAME=devdb
- DB_USER=devuser
- DB_PASS=changeme
- DEBUG=1

### 注意事項
1. 本地開發時，程式碼變更會自動重新載入，不需重新建置容器
2. 首次執行可能需要執行資料庫遷移：
```bash
docker-compose run --rm app sh -c "python manage.py migrate"
```

## 故障排除

如果遇到問題，可以嘗試以下步驟：

1. 檢查容器狀態：
```bash
docker-compose ps
```

2. 查看容器日誌：
```bash
docker-compose logs
```

3. 重建容器：
```bash
docker-compose down
docker-compose up --build
```
```