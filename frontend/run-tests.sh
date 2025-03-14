#!/bin/bash

# 確保腳本在錯誤時停止
set -e

# 顯示幫助信息
show_help() {
  echo "食譜應用端到端測試運行腳本"
  echo ""
  echo "用法: ./run-tests.sh [選項]"
  echo ""
  echo "選項:"
  echo "  -h, --help       顯示此幫助信息"
  echo "  -u, --ui         在 UI 模式下運行測試"
  echo "  -d, --debug      在調試模式下運行測試"
  echo "  -r, --report     生成 HTML 報告"
  echo "  -f, --file FILE  運行特定測試文件"
  echo ""
  echo "示例:"
  echo "  ./run-tests.sh                     # 運行所有測試"
  echo "  ./run-tests.sh -u                  # 在 UI 模式下運行測試"
  echo "  ./run-tests.sh -f auth/login.spec.js  # 運行特定測試文件"
  echo "  ./run-tests.sh -r                  # 運行測試並生成報告"
}

# 默認值
UI_MODE=false
DEBUG_MODE=false
REPORT_MODE=false
SPECIFIC_FILE=""

# 解析命令行參數
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -u|--ui)
      UI_MODE=true
      shift
      ;;
    -d|--debug)
      DEBUG_MODE=true
      shift
      ;;
    -r|--report)
      REPORT_MODE=true
      shift
      ;;
    -f|--file)
      SPECIFIC_FILE="$2"
      shift 2
      ;;
    *)
      echo "未知選項: $1"
      show_help
      exit 1
      ;;
  esac
done

# 構建命令
CMD="npx playwright test"

# 添加特定文件（如果指定）
if [ -n "$SPECIFIC_FILE" ]; then
  CMD="$CMD tests/e2e/$SPECIFIC_FILE"
fi

# 添加 UI 模式（如果啟用）
if [ "$UI_MODE" = true ]; then
  CMD="$CMD --ui"
fi

# 添加調試模式（如果啟用）
if [ "$DEBUG_MODE" = true ]; then
  CMD="$CMD --debug"
fi

# 添加報告模式（如果啟用）
if [ "$REPORT_MODE" = true ]; then
  CMD="$CMD --reporter=html"
fi

# 顯示將要運行的命令
echo "運行命令: $CMD"
echo ""

# 運行命令
eval $CMD

# 如果生成了報告，顯示報告
if [ "$REPORT_MODE" = true ]; then
  echo ""
  echo "測試報告已生成，運行以下命令查看報告："
  echo "npx playwright show-report"
fi 