# Generated by Django 4.2.23 on 2025-07-20 18:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_merge_20250720_0854'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='ip_address',
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='token',
            field=models.CharField(default='fc3a46e31a80', max_length=12, unique=True),
        ),
    ]
