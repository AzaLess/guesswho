from rest_framework import serializers
from .models import Game, Player, Fact, GuessEvent, Score, LiveGuess, StoryRating, ScoreLog

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

class LiveGuessSerializer(serializers.ModelSerializer):
    guesser_name = serializers.CharField(source='guesser.name', read_only=True)
    guesser_emoji = serializers.CharField(source='guesser.emoji', read_only=True)
    guessed_player_name = serializers.CharField(source='guessed_player.name', read_only=True)
    guessed_player_emoji = serializers.CharField(source='guessed_player.emoji', read_only=True)
    
    class Meta:
        model = LiveGuess
        fields = ['id', 'fact', 'guesser', 'guesser_name', 'guesser_emoji', 
                 'guessed_player', 'guessed_player_name', 'guessed_player_emoji', 
                 'is_correct', 'timestamp']

class StoryRatingSerializer(serializers.ModelSerializer):
    rater_name = serializers.CharField(source='rater.name', read_only=True)
    rater_emoji = serializers.CharField(source='rater.emoji', read_only=True)
    
    class Meta:
        model = StoryRating
        fields = ['id', 'fact', 'rater', 'rater_name', 'rater_emoji', 'rating', 'timestamp']

class ScoreLogSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    player_emoji = serializers.CharField(source='player.emoji', read_only=True)
    
    class Meta:
        model = ScoreLog
        fields = ['id', 'player', 'player_name', 'player_emoji', 'points', 'score_type', 'description', 'fact', 'timestamp']
