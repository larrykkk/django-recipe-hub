import axios from 'axios';
import commentService from '@/services/commentService';
import authHeader from '@/services/authHeader';

// 模擬 axios 和 authHeader
jest.mock('axios');
jest.mock('@/services/authHeader');

describe('評論服務', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authHeader.mockReturnValue({ 'Authorization': 'Token test-token' });
  });

  describe('getRecipeComments', () => {
    it('使用認證頭調用正確的 API 端點', async () => {
      const mockResponse = { data: [{ id: 1, content: 'Test comment' }] };
      axios.get.mockResolvedValue(mockResponse);

      const result = await commentService.getRecipeComments(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('comments/?recipe=1'),
        { headers: { 'Authorization': 'Token test-token' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createComment', () => {
    it('使用認證頭和數據調用正確的 API 端點', async () => {
      const mockComment = { content: 'New comment', recipe: 1 };
      const mockResponse = { data: { id: 1, ...mockComment } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await commentService.createComment(mockComment);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('comments/'),
        mockComment,
        { headers: { 'Authorization': 'Token test-token' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateComment', () => {
    it('使用認證頭和數據調用正確的 API 端點', async () => {
      const mockComment = { content: 'Updated comment', recipe: 1 };
      const mockResponse = { data: { id: 1, ...mockComment } };
      axios.put.mockResolvedValue(mockResponse);

      const result = await commentService.updateComment(1, mockComment);

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('comments/1/'),
        mockComment,
        { headers: { 'Authorization': 'Token test-token' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteComment', () => {
    it('使用認證頭調用正確的 API 端點', async () => {
      const mockResponse = {};
      axios.delete.mockResolvedValue(mockResponse);

      const result = await commentService.deleteComment(1);

      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('comments/1/'),
        { headers: { 'Authorization': 'Token test-token' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });
}); 