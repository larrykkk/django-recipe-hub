"""
評論 API 的測試。
"""
import json
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APIClient

from core.models import Comment, Recipe
from recipe.serializers import CommentSerializer

COMMENTS_URL = reverse('recipe:comment-list')


def detail_url(comment_id):
    """創建並返回評論詳情 URL。"""
    return reverse('recipe:comment-detail', args=[comment_id])


def create_recipe(user, **params):
    """創建並返回一個示例食譜。"""
    defaults = {
        'title': 'Sample recipe title',
        'time_minutes': 22,
        'price': 5.25,
        'description': 'Sample description',
        'link': 'http://example.com/recipe.pdf',
    }
    defaults.update(params)

    recipe = Recipe.objects.create(user=user, **defaults)
    return recipe


def create_user(**params):
    """創建並返回一個新用戶。"""
    return get_user_model().objects.create_user(**params)


def create_comment(user, recipe, **params):
    """創建並返回一個示例評論。"""
    defaults = {
        'content': 'Sample comment',
    }
    defaults.update(params)

    comment = Comment.objects.create(user=user, recipe=recipe, **defaults)
    return comment


class PublicCommentAPITests(TestCase):
    """測試未認證的 API 請求。"""

    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """測試調用 API 需要認證。"""
        res = self.client.get(COMMENTS_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateCommentAPITests(TestCase):
    """測試已認證的 API 請求。"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user(email='user@example.com', password='test123', name='Test User')
        self.client.force_authenticate(self.user)
        self.recipe = create_recipe(user=self.user)

    def test_retrieve_comments(self):
        """測試獲取評論列表。"""
        create_comment(user=self.user, recipe=self.recipe)
        create_comment(user=self.user, recipe=self.recipe)

        res = self.client.get(COMMENTS_URL)

        comments = Comment.objects.all().order_by('created_on')
        serializer = CommentSerializer(comments, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_filter_comments_by_recipe(self):
        """測試按食譜 ID 過濾評論。"""
        recipe2 = create_recipe(user=self.user, title='Another recipe')
        comment1 = create_comment(user=self.user, recipe=self.recipe)
        comment2 = create_comment(user=self.user, recipe=recipe2)

        res = self.client.get(COMMENTS_URL, {'recipe': self.recipe.id})

        serializer1 = CommentSerializer(comment1)
        serializer2 = CommentSerializer(comment2)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn(serializer1.data, res.data)
        self.assertNotIn(serializer2.data, res.data)

    def test_comments_ordered_by_created_date(self):
        """測試評論按創建日期排序。"""
        # 創建具有不同創建時間的評論
        comment1 = create_comment(user=self.user, recipe=self.recipe)
        comment2 = create_comment(user=self.user, recipe=self.recipe)
        
        # 手動更新 created_on 以測試排序
        comment1.created_on = timezone.now() - timedelta(hours=1)
        comment1.save()
        comment2.created_on = timezone.now()
        comment2.save()

        res = self.client.get(COMMENTS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data[0]['id'], comment1.id)
        self.assertEqual(res.data[1]['id'], comment2.id)

    def test_create_comment(self):
        """測試創建評論。"""
        payload = {
            'content': 'Sample comment',
            'recipe': self.recipe.id,
        }
        res = self.client.post(COMMENTS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment = Comment.objects.get(id=res.data['id'])
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.recipe.id, payload['recipe'])
        self.assertEqual(comment.user, self.user)

    def test_partial_update_comment(self):
        """測試部分更新評論。"""
        comment = create_comment(user=self.user, recipe=self.recipe)

        payload = {'content': 'Updated comment'}
        url = detail_url(comment.id)
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.user, self.user)

    def test_full_update_comment(self):
        """測試完全更新評論。"""
        comment = create_comment(user=self.user, recipe=self.recipe)
        
        # 創建另一個食譜用於測試
        new_recipe = create_recipe(user=self.user, title='Another recipe')
        
        payload = {
            'content': 'Updated comment content',
            'recipe': new_recipe.id,
        }
        url = detail_url(comment.id)
        res = self.client.put(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.recipe.id, payload['recipe'])
        self.assertEqual(comment.user, self.user)

    def test_delete_comment(self):
        """測試刪除評論。"""
        comment = create_comment(user=self.user, recipe=self.recipe)
        
        url = detail_url(comment.id)
        res = self.client.delete(url)
        
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Comment.objects.filter(id=comment.id).exists())

    def test_other_users_cannot_update_comment(self):
        """測試用戶無法更新其他用戶的評論。"""
        other_user = create_user(email='other@example.com', password='test123', name='Other User')
        comment = create_comment(user=other_user, recipe=self.recipe)
        
        payload = {'content': 'Updated by unauthorized user'}
        url = detail_url(comment.id)
        res = self.client.patch(url, payload)
        
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        comment.refresh_from_db()
        self.assertNotEqual(comment.content, payload['content'])

    def test_other_users_cannot_delete_comment(self):
        """測試用戶無法刪除其他用戶的評論。"""
        other_user = create_user(email='other@example.com', password='test123', name='Other User')
        comment = create_comment(user=other_user, recipe=self.recipe)
        
        url = detail_url(comment.id)
        res = self.client.delete(url)
        
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Comment.objects.filter(id=comment.id).exists())

    def test_comment_includes_user_details(self):
        """測試評論響應包含用戶詳細信息。"""
        comment = create_comment(user=self.user, recipe=self.recipe)
        
        url = detail_url(comment.id)
        res = self.client.get(url)
        
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['id'], self.user.id)
        self.assertEqual(res.data['user']['name'], self.user.name)
        self.assertEqual(res.data['user']['email'], self.user.email)