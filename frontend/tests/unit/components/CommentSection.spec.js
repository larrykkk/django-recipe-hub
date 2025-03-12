import { shallowMount, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';
import CommentSection from '@/components/CommentSection.vue';
import { useCommentStore } from '@/store/comment';
import { useAuthStore } from '@/store/auth';

// 模擬 date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago')
}));

describe('CommentSection.vue', () => {
  let wrapper;
  let commentStore;
  let authStore;
  
  const createComponent = (options = {}) => {
    const { 
      isLoggedIn = true, 
      currentUser = { id: 1, name: 'Test User', email: 'test@example.com' },
      comments = [],
      loading = false,
      error = null,
      recipeId = 1
    } = options;
    
    const pinia = createTestingPinia({
      initialState: {
        comment: { comments, loading, error },
        auth: { loggedIn: isLoggedIn, user: currentUser }
      }
    });
    
    commentStore = useCommentStore(pinia);
    authStore = useAuthStore(pinia);
    
    // 模擬 store actions
    commentStore.fetchRecipeComments = jest.fn();
    commentStore.createComment = jest.fn();
    commentStore.updateComment = jest.fn();
    commentStore.deleteComment = jest.fn();
    
    return mount(CommentSection, {
      global: {
        plugins: [pinia],
        stubs: ['router-link']
      },
      props: {
        recipeId
      }
    });
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('在掛載時獲取評論', async () => {
    wrapper = createComponent();
    
    expect(commentStore.fetchRecipeComments).toHaveBeenCalledWith(1);
  });
  
  it('在加載評論時顯示加載狀態', () => {
    wrapper = createComponent({ loading: true, comments: [] });
    
    expect(wrapper.find('.loading-comments').exists()).toBe(true);
  });
  
  it('當有錯誤時顯示錯誤信息', () => {
    wrapper = createComponent({ error: 'Failed to load comments' });
    
    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message p').text()).toBe('Failed to load comments. Please try again.');
  });
  
  it('當用戶未登錄時顯示登錄提示', () => {
    wrapper = createComponent({ isLoggedIn: false });
    
    expect(wrapper.find('.login-prompt').exists()).toBe(true);
    expect(wrapper.find('.login-prompt p').text()).toContain('Please');
  });
  
  it('當用戶已登錄時顯示評論表單', () => {
    wrapper = createComponent();
    
    expect(wrapper.find('.comment-form').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
  });
  
  it('當沒有評論時顯示空狀態', () => {
    wrapper = createComponent({ comments: [] });
    
    expect(wrapper.find('.no-comments').exists()).toBe(true);
    expect(wrapper.find('.no-comments p').text()).toBe('Be the first to comment on this recipe!');
  });
  
  it('正確渲染評論', () => {
    const comments = [
      { 
        id: 1, 
        content: 'Test comment 1', 
        user: { id: 1, name: 'User 1', email: 'user1@example.com' },
        created_on: '2023-01-01T12:00:00Z',
        updated_on: '2023-01-01T12:00:00Z'
      },
      { 
        id: 2, 
        content: 'Test comment 2', 
        user: { id: 2, name: 'User 2', email: 'user2@example.com' },
        created_on: '2023-01-02T12:00:00Z',
        updated_on: '2023-01-02T12:00:00Z'
      }
    ];
    
    wrapper = createComponent({ comments });
    
    const commentItems = wrapper.findAll('.comment-item');
    expect(commentItems.length).toBe(2);
    
    expect(commentItems[0].find('.username').text()).toBe('User 1');
    expect(commentItems[0].find('.comment-content').text()).toBe('Test comment 1');
    expect(commentItems[0].find('.comment-time').text()).toBe('5 minutes ago');
    
    expect(commentItems[1].find('.username').text()).toBe('User 2');
    expect(commentItems[1].find('.comment-content').text()).toBe('Test comment 2');
  });
  
  it('提交新評論', async () => {
    wrapper = createComponent();
    
    const textarea = wrapper.find('textarea');
    await textarea.setValue('New comment');
    
    const submitButton = wrapper.find('.comment-form-footer button');
    await submitButton.trigger('click');
    
    expect(commentStore.createComment).toHaveBeenCalledWith({
      content: 'New comment',
      recipe: 1
    });
    
    // 檢查提交後文本區域是否被清空
    await nextTick();
    expect(textarea.element.value).toBe('');
  });
  
  it('為用戶自己的評論顯示編輯/刪除按鈕', () => {
    const comments = [
      { 
        id: 1, 
        content: 'My comment', 
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        created_on: '2023-01-01T12:00:00Z',
        updated_on: '2023-01-01T12:00:00Z'
      },
      { 
        id: 2, 
        content: 'Someone else\'s comment', 
        user: { id: 2, name: 'Other User', email: 'other@example.com' },
        created_on: '2023-01-02T12:00:00Z',
        updated_on: '2023-01-02T12:00:00Z'
      }
    ];
    
    wrapper = createComponent({ comments, currentUser: { id: 1, name: 'Test User', email: 'test@example.com' } });
    
    const commentItems = wrapper.findAll('.comment-item');
    
    // 第一條評論是用戶自己的，應該有編輯/刪除按鈕
    expect(commentItems[0].find('.comment-actions').exists()).toBe(true);
    expect(commentItems[0].find('.edit-btn').exists()).toBe(true);
    expect(commentItems[0].find('.delete-btn').exists()).toBe(true);
    
    // 第二條評論不是用戶自己的，不應該有編輯/刪除按鈕
    expect(commentItems[1].find('.comment-actions').exists()).toBe(false);
  });
  
  it('編輯評論', async () => {
    const comments = [
      { 
        id: 1, 
        content: 'Original comment', 
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        created_on: '2023-01-01T12:00:00Z',
        updated_on: '2023-01-01T12:00:00Z'
      }
    ];
    
    wrapper = createComponent({ comments });
    
    // 點擊編輯按鈕
    const editButton = wrapper.find('.edit-btn');
    await editButton.trigger('click');
    
    // 編輯表單應該可見
    expect(wrapper.find('.edit-comment-form').exists()).toBe(true);
    
    // 編輯評論
    const editTextarea = wrapper.find('.edit-comment-form textarea');
    await editTextarea.setValue('Updated comment');
    
    // 保存編輯
    const saveButton = wrapper.find('.edit-actions .btn-primary');
    await saveButton.trigger('click');
    
    expect(commentStore.updateComment).toHaveBeenCalledWith(1, {
      content: 'Updated comment',
      recipe: 1
    });
  });
  
  it('確認後刪除評論', async () => {
    const comments = [
      { 
        id: 1, 
        content: 'Comment to delete', 
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        created_on: '2023-01-01T12:00:00Z',
        updated_on: '2023-01-01T12:00:00Z'
      }
    ];
    
    wrapper = createComponent({ comments });
    
    // 點擊刪除按鈕（第一次點擊是確認）
    const deleteButton = wrapper.find('.delete-btn');
    await deleteButton.trigger('click');
    
    // 按鈕現在應該處於確認狀態
    expect(deleteButton.classes()).toContain('confirm-delete');
    expect(deleteButton.text()).toBe('Confirm Delete');
    
    // 再次點擊確認刪除
    await deleteButton.trigger('click');
    
    expect(commentStore.deleteComment).toHaveBeenCalledWith(1);
  });
}); 