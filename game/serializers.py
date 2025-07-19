from rest_framework import serializers
from .models import Game, Player, Fact, GuessEvent, Score

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class FactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fact
        fields = '__all__'

class GuessEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuessEvent
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    player_emoji = serializers.CharField(source='player.emoji', read_only=True)
    
    class Meta:
        model = Score
        fields = ['id', 'player', 'player_name', 'player_emoji', 'game', 'points']
