"""
Serializers for recipe APIs
"""
from rest_framework import serializers

from core.models import (
    Recipe,
    Tag,
    Ingredient,
    Comment,
)
from core.utils import (
    encode_recipe_id,
    encode_comment_id,
    encode_tag_id,
    encode_ingredient_id,
    decode_recipe_id,
)
from user.serializers import UserSerializer

class IngredientSerializer(serializers.ModelSerializer):
    """Serializer for ingredients."""
    encoded_id = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = ['id', 'encoded_id', 'name']
        read_only_fields = ['id', 'encoded_id']

    def get_encoded_id(self, obj):
        """Get encoded ID for the ingredient."""
        return encode_ingredient_id(obj.id)


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""
    encoded_id = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'encoded_id', 'name']
        read_only_fields = ['id', 'encoded_id']

    def get_encoded_id(self, obj):
        """Get encoded ID for the tag."""
        return encode_tag_id(obj.id)


class RecipeSerializer(serializers.ModelSerializer):
    """Serializer for recipes."""
    tags = TagSerializer(many=True, required=False)
    ingredients = IngredientSerializer(many=True, required=False)
    encoded_id = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'encoded_id', 'title', 'time_minutes', 'price', 'link', 'tags', 'ingredients', 'user', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'encoded_id', 'user', 'created_at', 'updated_at']

    def get_encoded_id(self, obj):
        """Get encoded ID for the recipe."""
        return encode_recipe_id(obj.id)

    def _get_or_create_tags(self, tags, recipe):
        """Handle getting or creating tags as needed."""
        auth_user = self.context['request'].user
        for tag in tags:
            tag_obj, created = Tag.objects.get_or_create(
                user=auth_user,
                **tag,
            )
            recipe.tags.add(tag_obj)

    def _get_or_create_ingredients(self, ingredients, recipe):
        """Handle getting or creating ingredients as needed."""
        auth_user = self.context['request'].user
        for ingredient in ingredients:
            ingredient_obj, created = Ingredient.objects.get_or_create(
                user=auth_user,
                **ingredient,
            )
            recipe.ingredients.add(ingredient_obj)

    def create(self, validated_data):
        """Create a recipe."""
        tags = validated_data.pop('tags', [])
        ingredients = validated_data.pop('ingredients', [])
        recipe = Recipe.objects.create(**validated_data)
        self._get_or_create_tags(tags, recipe)
        self._get_or_create_ingredients(ingredients, recipe)

        return recipe

    def update(self, instance, validated_data):
        """Update recipe."""
        tags = validated_data.pop('tags', None)
        ingredients = validated_data.pop('ingredients', None)
        if tags is not None:
            instance.tags.clear()
            self._get_or_create_tags(tags, instance)
        if ingredients is not None:
            instance.ingredients.clear()
            self._get_or_create_ingredients(ingredients, instance)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments."""
    user = serializers.SerializerMethodField()
    encoded_id = serializers.SerializerMethodField()
    encoded_recipe_id = serializers.SerializerMethodField()
    recipe = serializers.CharField(write_only=True)  # 將 recipe 字段改為 CharField，以接受 hashid

    class Meta:
        model = Comment
        fields = [
            'id',
            'encoded_id',
            'content',
            'created_on',
            'updated_on',
            'recipe',
            'encoded_recipe_id',
            'user',
        ]
        read_only_fields = ['id', 'encoded_id', 'user', 'created_on', 'updated_on', 'encoded_recipe_id']

    def get_encoded_id(self, obj):
        """Get encoded ID for the comment."""
        return encode_comment_id(obj.id)

    def get_encoded_recipe_id(self, obj):
        """Get encoded ID for the recipe."""
        return encode_recipe_id(obj.recipe.id)

    def get_user(self, obj):
        """Return user details as an object with id and email."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
        }

    def validate_recipe(self, value):
        """Validate and convert recipe hashid to Recipe object."""
        recipe_id = decode_recipe_id(value)
        if recipe_id is None:
            # 如果解碼失敗，嘗試作為普通 ID 處理
            try:
                recipe_id = int(value)
            except ValueError:
                raise serializers.ValidationError('Invalid recipe ID')
        
        try:
            return Recipe.objects.get(id=recipe_id)
        except Recipe.DoesNotExist:
            raise serializers.ValidationError('Recipe not found')

    def create(self, validated_data):
        """Create a comment and associate with authenticated user."""
        validated_data['user'] = self.context['request'].user
        return Comment.objects.create(**validated_data)


class RecipeDetailSerializer(RecipeSerializer):
    """Serializer for recipe detail view."""
    class Meta(RecipeSerializer.Meta):
        fields = RecipeSerializer.Meta.fields + ['description']


class RecipeImageSerializer(serializers.ModelSerializer):
    """Serializer for uploading images to recipes."""
    encoded_id = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'encoded_id', 'image']
        read_only_fields = ['id', 'encoded_id']
        extra_kwargs = {'image': {'required': 'True'}}

    def get_encoded_id(self, obj):
        """Get encoded ID for the recipe."""
        return encode_recipe_id(obj.id)
