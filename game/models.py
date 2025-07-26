from django.db import models
import uuid

class Game(models.Model):
    token = models.CharField(max_length=12, unique=True, default=uuid.uuid4().hex[:12])
    created_at = models.DateTimeField(auto_now_add=True)
    ended = models.BooleanField(default=False)
    started = models.BooleanField(default=False)
    last_fact_added = models.DateTimeField(null=True, blank=True)
    current_fact = models.ForeignKey('Fact', null=True, blank=True, on_delete=models.SET_NULL, related_name='current_in_games')
    game_phase = models.CharField(max_length=20, default='guessing', choices=[
        ('guessing', 'Guessing Phase'),
        ('storytelling', 'Story Telling Phase'),
        ('rating', 'Story Rating Phase')
    ])
    story_teller = models.ForeignKey('Player', null=True, blank=True, on_delete=models.SET_NULL, related_name='telling_story_in_games')

    def __str__(self):
        return f"Game {self.token}"

class Player(models.Model):
    game = models.ForeignKey(Game, related_name='players', on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    is_host = models.BooleanField(default=False)
    emoji = models.CharField(max_length=4, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    has_finished_story = models.BooleanField(default=False)
    has_rated_story = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'Host' if self.is_host else 'Player'})"

class Fact(models.Model):
    game = models.ForeignKey(Game, related_name='facts', on_delete=models.CASCADE)
    author = models.ForeignKey(Player, related_name='facts', on_delete=models.CASCADE)
    text = models.TextField()
    guessed = models.BooleanField(default=False)
    story_revealed = models.BooleanField(default=False)
    story = models.TextField(blank=True, null=True)
    story_rating_average = models.FloatField(null=True, blank=True)
    story_rating_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Fact by {self.author.name} (Guessed: {self.guessed})"

class GuessEvent(models.Model):
    fact = models.ForeignKey(Fact, related_name='guess_events', on_delete=models.CASCADE)
    correct_guesser = models.ForeignKey(Player, related_name='correct_guesses', on_delete=models.CASCADE)
    wrong_guess_count = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GuessEvent for Fact {self.fact.id}"

class Score(models.Model):
    player = models.ForeignKey(Player, related_name='scores', on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name='scores', on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

    class Meta:
        unique_together = (('player', 'game'),)

    def __str__(self):
        return f"{self.player.name}: {self.points} pts"

class LiveGuess(models.Model):
    fact = models.ForeignKey(Fact, related_name='live_guesses', on_delete=models.CASCADE)
    guesser = models.ForeignKey(Player, related_name='live_guesses', on_delete=models.CASCADE)
    guessed_player = models.ForeignKey(Player, related_name='guessed_for', on_delete=models.CASCADE)
    is_correct = models.BooleanField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.guesser.name} guessed {self.guessed_player.name} for fact {self.fact.id}"

class StoryRating(models.Model):
    fact = models.ForeignKey(Fact, related_name='story_ratings', on_delete=models.CASCADE)
    rater = models.ForeignKey(Player, related_name='story_ratings', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(1, 'Boring'), (2, 'Good'), (3, 'Amazing')])
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('fact', 'rater'),)

    def __str__(self):
        return f"{self.rater.name} rated fact {self.fact.id}: {self.rating}"

class ScoreLog(models.Model):
    SCORE_TYPES = [
        ('correct_guess', 'Correct Guess'),
        ('wrong_guesses', 'Wrong Guesses on Fact'),
        ('story_rating', 'Story Rating Bonus'),
    ]
    
    game = models.ForeignKey(Game, related_name='score_logs', on_delete=models.CASCADE)
    player = models.ForeignKey(Player, related_name='score_logs', on_delete=models.CASCADE)
    points = models.IntegerField()
    score_type = models.CharField(max_length=20, choices=SCORE_TYPES)
    description = models.CharField(max_length=200)
    fact = models.ForeignKey(Fact, null=True, blank=True, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player.name}: {self.points:+d} pts ({self.score_type})"
