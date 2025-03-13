"""
Utility functions for the application.
"""
from hashids import Hashids
from django.conf import settings

# 使用 Django 的 SECRET_KEY 作為 salt 的一部分，增加安全性
HASHIDS_SALT = getattr(settings, 'HASHIDS_SALT', settings.SECRET_KEY[:20] + "recipe_app_salt")
HASHIDS_MIN_LENGTH = getattr(settings, 'HASHIDS_MIN_LENGTH', 7)

# 為不同模型創建不同的 Hashids 實例
recipe_hashids = Hashids(salt=HASHIDS_SALT + "_recipe", min_length=HASHIDS_MIN_LENGTH)
comment_hashids = Hashids(salt=HASHIDS_SALT + "_comment", min_length=HASHIDS_MIN_LENGTH)
tag_hashids = Hashids(salt=HASHIDS_SALT + "_tag", min_length=HASHIDS_MIN_LENGTH)
ingredient_hashids = Hashids(salt=HASHIDS_SALT + "_ingredient", min_length=HASHIDS_MIN_LENGTH)


def encode_recipe_id(id):
    """Encode a recipe ID to a hashid."""
    return recipe_hashids.encode(id)


def decode_recipe_id(hashid):
    """Decode a recipe hashid to its original ID."""
    decoded = recipe_hashids.decode(hashid)
    if decoded:
        return decoded[0]
    return None


def encode_comment_id(id):
    """Encode a comment ID to a hashid."""
    return comment_hashids.encode(id)


def decode_comment_id(hashid):
    """Decode a comment hashid to its original ID."""
    decoded = comment_hashids.decode(hashid)
    if decoded:
        return decoded[0]
    return None


def encode_tag_id(id):
    """Encode a tag ID to a hashid."""
    return tag_hashids.encode(id)


def decode_tag_id(hashid):
    """Decode a tag hashid to its original ID."""
    decoded = tag_hashids.decode(hashid)
    if decoded:
        return decoded[0]
    return None


def encode_ingredient_id(id):
    """Encode an ingredient ID to a hashid."""
    return ingredient_hashids.encode(id)


def decode_ingredient_id(hashid):
    """Decode an ingredient hashid to its original ID."""
    decoded = ingredient_hashids.decode(hashid)
    if decoded:
        return decoded[0]
    return None 