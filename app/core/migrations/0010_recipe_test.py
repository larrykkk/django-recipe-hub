# Generated by Django 4.0.10 on 2025-03-28 12:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_recipe_created_at_recipe_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='test',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
