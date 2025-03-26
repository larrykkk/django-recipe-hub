"""
Views for the recipe APIs
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)

from rest_framework import (
    viewsets,
    mixins,
    status,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound

from core.models import (
    Recipe,
    Tag,
    Ingredient,
    Comment,
)
from recipe import serializers
from core.utils import (
    decode_recipe_id,
    decode_tag_id,
    decode_ingredient_id,
    decode_comment_id,
)


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'tags',
                OpenApiTypes.STR,
                description='Comma separated list of tag IDs to filter',
            ),
            OpenApiParameter(
                'ingredients',
                OpenApiTypes.STR,
                description='Comma separated list of ingredient IDs to filter',
            ),
            OpenApiParameter(
                'userId',
                OpenApiTypes.STR,
                description='Filter by user ID',
            ),
        ]
    )
)

class RecipeViewSet(viewsets.ModelViewSet):
    """View for manage recipe APIs."""
    serializer_class = serializers.RecipeDetailSerializer
    queryset = Recipe.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'  # 默認使用 pk，但我們會在 get_object 中處理 hashid

    def _params_to_ints(self, qs):
        """Convert a list of strings to integers."""
        # 嘗試將 hashids 轉換為實際 ID
        result = []
        for str_id in qs.split(','):
            # 先嘗試作為 hashid 解碼
            decoded_id = decode_tag_id(str_id)
            if decoded_id is None:
                # 如果解碼失敗，嘗試作為普通 ID 處理
                try:
                    decoded_id = int(str_id)
                except ValueError:
                    continue
            result.append(decoded_id)
        return result

    def get_queryset(self):
        """Retrieve recipes for authenticated user."""
        tags = self.request.query_params.get('tags')
        ingredients = self.request.query_params.get('ingredients')
        userId = self.request.query_params.get('userId')
        queryset = self.queryset

        if tags:
            tag_ids = self._params_to_ints(tags)
            queryset = queryset.filter(tags__id__in=tag_ids)
        if ingredients:
            ingredient_ids = self._params_to_ints(ingredients)
            queryset = queryset.filter(ingredients__id__in=ingredient_ids)
        if userId:
            queryset = queryset.filter(user_id=userId)

        # return queryset.filter(
        #     user=self.request.user
        # ).order_by('-id').distinct()
        return queryset

    def get_object(self):
        """Retrieve and return a recipe, checking permissions."""
        # 獲取 URL 中的 ID 或 hashid
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # 嘗試將 lookup_value 解碼為實際 ID
        decoded_id = decode_recipe_id(lookup_value)
        if decoded_id is None:
            # 如果解碼失敗，嘗試作為普通 ID 處理
            try:
                decoded_id = int(lookup_value)
            except ValueError:
                raise NotFound("Invalid recipe ID")
        
        # 使用解碼後的 ID 查詢對象
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(id=decoded_id).first()
        if obj is None:
            raise NotFound("Recipe not found")
        
        # 檢查權限
        self.check_object_permissions(self.request, obj)
        return obj

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'list':
            return serializers.RecipeSerializer
        elif self.action == 'upload_image':
            return serializers.RecipeImageSerializer

        return self.serializer_class

    def perform_create(self, serializer):
        """Create a new recipe."""
        serializer.save(user=self.request.user)

    @action(methods=['POST'], detail=True, url_path='upload-image')
    def upload_image(self, request, pk=None):
        """Upload an image to recipe."""
        recipe = self.get_object()
        serializer = self.get_serializer(recipe, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'assigned_only',
                OpenApiTypes.INT, enum=[0, 1],
                description='Filter by items assigned to recipes.',
            ),
        ]
    )
)
class BaseRecipeAttrViewSet(mixins.DestroyModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    """Base viewset for recipe attributes."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        """Filter queryset to authenticated user."""
        assigned_only = bool(
            int(self.request.query_params.get('assigned_only', 0))
        )
        queryset = self.queryset
        if assigned_only:
            queryset = queryset.filter(recipe__isnull=False)

        return queryset.filter(
            user=self.request.user
        ).order_by('-name').distinct()

    def get_object(self):
        """Retrieve and return an object, checking permissions."""
        # 獲取 URL 中的 ID 或 hashid
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # 根據視圖類型選擇適當的解碼函數
        if isinstance(self, TagViewSet):
            decoded_id = decode_tag_id(lookup_value)
        elif isinstance(self, IngredientViewSet):
            decoded_id = decode_ingredient_id(lookup_value)
        else:
            decoded_id = None
            
        if decoded_id is None:
            # 如果解碼失敗，嘗試作為普通 ID 處理
            try:
                decoded_id = int(lookup_value)
            except ValueError:
                raise NotFound("Invalid ID")
        
        # 使用解碼後的 ID 查詢對象
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(id=decoded_id).first()
        if obj is None:
            raise NotFound("Object not found")
        
        # 檢查權限
        self.check_object_permissions(self.request, obj)
        return obj


class TagViewSet(BaseRecipeAttrViewSet):
    """Manage tags in the database."""
    serializer_class = serializers.TagSerializer
    queryset = Tag.objects.all()


class IngredientViewSet(BaseRecipeAttrViewSet):
    """Manage ingredients in the database."""
    serializer_class = serializers.IngredientSerializer
    queryset = Ingredient.objects.all()

@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'recipe',
                OpenApiTypes.STR,
                description='Filter comments by recipe ID or hashid',
            ),
        ]
    )
)
class CommentViewSet(viewsets.ModelViewSet):
    """Manage comments in the database."""
    serializer_class = serializers.CommentSerializer
    queryset = Comment.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        """Retrieve comments with filtering options."""
        recipe_param = self.request.query_params.get('recipe')
        queryset = self.queryset
        
        if recipe_param:
            # 嘗試將 recipe_param 解碼為實際 ID
            recipe_id = decode_recipe_id(recipe_param)
            if recipe_id is None:
                # 如果解碼失敗，嘗試作為普通 ID 處理
                try:
                    recipe_id = int(recipe_param)
                except ValueError:
                    recipe_id = None
            
            if recipe_id is not None:
                queryset = queryset.filter(recipe_id=recipe_id)
            
        return queryset.filter(
            user=self.request.user
        ).order_by('-created_on')

    def perform_create(self, serializer):
        """Create a new comment."""
        serializer.save(user=self.request.user)

    def get_object(self):
        """Retrieve and return a comment, checking permissions."""
        # 獲取 URL 中的 ID 或 hashid
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # 嘗試將 lookup_value 解碼為實際 ID
        decoded_id = decode_comment_id(lookup_value)
        if decoded_id is None:
            # 如果解碼失敗，嘗試作為普通 ID 處理
            try:
                decoded_id = int(lookup_value)
            except ValueError:
                raise NotFound("Invalid comment ID")
        
        # 使用解碼後的 ID 查詢對象
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(id=decoded_id).first()
        if obj is None:
            raise NotFound("Comment not found")
        
        # 確保用戶只能操作自己的評論
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to modify this comment.")
        
        return obj