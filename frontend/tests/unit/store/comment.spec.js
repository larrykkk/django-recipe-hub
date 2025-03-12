import { setActivePinia, createPinia } from 'pinia';
import { useCommentStore } from '@/store/comment';
import commentService from '@/services/commentService';

// 模擬評論服務
jest.mock('@/services/commentService');

describe('評論 Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCommentStore();
    jest.clearAllMocks();
  });

  describe('fetchRecipeComments', () => {
    it('成功獲取食譜的評論', async () => {
      const mockComments = [
        { id: 1, content: 'Comment 1', recipe: 1 },
        { id: 2, content: 'Comment 2', recipe: 1 }
      ];
      
      commentService.getRecipeComments.mockResolvedValue({ data: mockComments });
      
      await store.fetchRecipeComments(1);
      
      expect(commentService.getRecipeComments).toHaveBeenCalledWith(1);
      expect(store.comments).toEqual(mockComments);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('處理獲取評論時的錯誤', async () => {
      const errorMessage = 'Failed to fetch comments';
      commentService.getRecipeComments.mockRejectedValue(new Error(errorMessage));
      
      await store.fetchRecipeComments(1);
      
      expect(commentService.getRecipeComments).toHaveBeenCalledWith(1);
      expect(store.comments).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('createComment', () => {
    it('成功創建評論', async () => {
      const newComment = { content: 'New comment', recipe: 1 };
      const createdComment = { id: 1, ...newComment };
      
      commentService.createComment.mockResolvedValue({ data: createdComment });
      
      await store.createComment(newComment);
      
      expect(commentService.createComment).toHaveBeenCalledWith(newComment);
      expect(store.comments).toContain(createdComment);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('處理創建評論時的錯誤', async () => {
      const newComment = { content: 'New comment', recipe: 1 };
      const errorMessage = 'Failed to create comment';
      
      commentService.createComment.mockRejectedValue(new Error(errorMessage));
      
      await expect(store.createComment(newComment)).rejects.toThrow();
      
      expect(commentService.createComment).toHaveBeenCalledWith(newComment);
      expect(store.comments).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('updateComment', () => {
    it('成功更新評論', async () => {
      // 設置初始狀態
      store.comments = [
        { id: 1, content: 'Original comment', recipe: 1 }
      ];
      
      const updatedComment = { id: 1, content: 'Updated comment', recipe: 1 };
      
      commentService.updateComment.mockResolvedValue({ data: updatedComment });
      
      await store.updateComment(1, { content: 'Updated comment', recipe: 1 });
      
      expect(commentService.updateComment).toHaveBeenCalledWith(1, { content: 'Updated comment', recipe: 1 });
      expect(store.comments[0]).toEqual(updatedComment);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('處理更新評論時的錯誤', async () => {
      // 設置初始狀態
      store.comments = [
        { id: 1, content: 'Original comment', recipe: 1 }
      ];
      
      const errorMessage = 'Failed to update comment';
      
      commentService.updateComment.mockRejectedValue(new Error(errorMessage));
      
      await expect(store.updateComment(1, { content: 'Updated comment', recipe: 1 })).rejects.toThrow();
      
      expect(commentService.updateComment).toHaveBeenCalledWith(1, { content: 'Updated comment', recipe: 1 });
      expect(store.comments[0].content).toBe('Original comment');
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('deleteComment', () => {
    it('成功刪除評論', async () => {
      // 設置初始狀態
      store.comments = [
        { id: 1, content: 'Comment to delete', recipe: 1 }
      ];
      
      commentService.deleteComment.mockResolvedValue({});
      
      await store.deleteComment(1);
      
      expect(commentService.deleteComment).toHaveBeenCalledWith(1);
      expect(store.comments).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('處理刪除評論時的錯誤', async () => {
      // 設置初始狀態
      store.comments = [
        { id: 1, content: 'Comment to delete', recipe: 1 }
      ];
      
      const errorMessage = 'Failed to delete comment';
      
      commentService.deleteComment.mockRejectedValue(new Error(errorMessage));
      
      await expect(store.deleteComment(1)).rejects.toThrow();
      
      expect(commentService.deleteComment).toHaveBeenCalledWith(1);
      expect(store.comments).toHaveLength(1);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });
}); 