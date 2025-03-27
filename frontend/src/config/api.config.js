// 獲取環境變量中的 API URL，如果不存在則使用默認值
// 設置 API 基礎 URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_PATHS = {
  USER: `${API_BASE_URL}/api/user/`,
  RECIPE: `${API_BASE_URL}/api/recipe/`,
};

export default {
  API_BASE_URL,
  API_PATHS,
};