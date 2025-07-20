from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("game", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="game",
            name="last_fact_added",
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
