from django.contrib import admin
from .models import Game, Player, Fact, GuessEvent, Score

admin.site.register(Game)
admin.site.register(Player)
admin.site.register(Fact)
admin.site.register(GuessEvent)
admin.site.register(Score)

# Register your models here.
