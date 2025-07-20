from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Game, Player, Fact, GuessEvent, Score
from rest_framework.views import APIView

class StartGameView(APIView):
    def post(self, request):
        token = request.data.get('token')
        game = Game.objects.filter(token=token, ended=False).first()
        if not game:
            return Response({'error': 'Invalid or ended game token.'}, status=400)
        if game.started:
            return Response({'status': 'Already started.'})
        game.started = True
        game.save()
        return Response({'status': 'Game started.'})

from .serializers import GameSerializer, PlayerSerializer, FactSerializer, GuessEventSerializer, ScoreSerializer
import uuid

class GameCreateView(generics.CreateAPIView):
    serializer_class = GameSerializer

    def perform_create(self, serializer):
        import random
        animals = [
            "lion", "tiger", "bear", "fox", "wolf", "panda", "koala", "zebra", "giraffe", "monkey",
            "cat", "dog", "mouse", "eagle", "owl", "shark", "whale", "dolphin", "rabbit", "frog",
            "horse", "sheep", "goat", "pig", "deer", "bat", "duck", "swan", "crab", "crow",
            "bee", "ant", "moose", "lynx", "otter", "camel", "yak", "mole", "yak", "elk"
        ]
        tries = 0
        while True:
            animal = random.choice(animals)
            number = random.randint(0, 99)
            token = f"{animal}{number:02d}"
            if not Game.objects.filter(token=token).exists():
                break
            tries += 1
            if tries > 1000:
                raise Exception("Cannot generate unique token")
        game = serializer.save(token=token)
        # Создаём ведущего сразу
        name = self.request.data.get('name', 'Ведущий')
        EMOJIS = [
            "🦁", "🐯", "🐻", "🦊", "🐼", "🐸", "🐵", "🐶", "🐱", "🦄", "🐷", "🐨", "🦓", "🦒", "🦉", "🦅"
        ]
        used_emojis = set(Player.objects.filter(game=game).values_list('emoji', flat=True))
        available_emojis = [e for e in EMOJIS if e not in used_emojis]
        emoji = available_emojis[0] if available_emojis else "🙂"
        player = Player.objects.create(game=game, name=name, is_host=True, emoji=emoji)
        Score.objects.create(player=player, game=game)


class JoinGameView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        name = request.data.get('name')
        is_host = request.data.get('is_host', False)
        game = Game.objects.filter(token=token, ended=False).first()
        if not game:
            return Response({'error': 'Invalid or ended game token.'}, status=400)
        # Автоматическое назначение уникального эмоджи
        EMOJIS = [
            "🦁", "🐯", "🐻", "🦊", "🐼", "🐸", "🐵", "🐶", "🐱", "🦄", "🐷", "🐨", "🦓", "🦒", "🦉", "🦅"
        ]
        used_emojis = set(Player.objects.filter(game=game).values_list('emoji', flat=True))
        available_emojis = [e for e in EMOJIS if e not in used_emojis]
        emoji = available_emojis[0] if available_emojis else "🙂"
        player = Player.objects.create(game=game, name=name, is_host=is_host, emoji=emoji)
        Score.objects.create(player=player, game=game)
        return Response(PlayerSerializer(player).data)

class FactSubmitView(views.APIView):
    def post(self, request):
        player_id = request.data.get('player_id')
        text = request.data.get('text')
        player = Player.objects.filter(id=player_id).first()
        if not player:
            return Response({'error': 'Invalid player.'}, status=400)
        fact = Fact.objects.create(game=player.game, author=player, text=text)
        return Response(FactSerializer(fact).data)

class HostGuessEventView(views.APIView):
    def post(self, request):
        fact_id = request.data.get('fact_id')
        correct_guesser_id = request.data.get('correct_guesser_id')
        wrong_guess_count = int(request.data.get('wrong_guess_count', 0))
        fact = Fact.objects.filter(id=fact_id, guessed=False).first()
        if not fact:
            return Response({'error': 'Invalid or already guessed fact.'}, status=400)
        correct_guesser = Player.objects.filter(id=correct_guesser_id, game=fact.game).first()
        if not correct_guesser:
            return Response({'error': 'Invalid guesser.'}, status=400)
        # Mark fact as guessed
        fact.guessed = True
        fact.save()
        # Record event
        event = GuessEvent.objects.create(fact=fact, correct_guesser=correct_guesser, wrong_guess_count=wrong_guess_count)
        # Award points
        correct_score = Score.objects.get(player=correct_guesser, game=fact.game)
        correct_score.points += 3
        correct_score.save()
        author_score = Score.objects.get(player=fact.author, game=fact.game)
        author_score.points += wrong_guess_count
        author_score.save()
        return Response({
            'guess_event': GuessEventSerializer(event).data,
            'updated_scores': [ScoreSerializer(correct_score).data, ScoreSerializer(author_score).data]
        })

class ScoreboardView(views.APIView):
    def get(self, request, token):
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        scores = Score.objects.filter(game=game).order_by('-points')
        return Response(ScoreSerializer(scores, many=True).data)

class GameStateView(views.APIView):
    def get(self, request, token):
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        # Используем детерминированную случайность на основе ID игры
        # чтобы порядок был одинаковым для всех игроков
        import random
        facts_list = list(Fact.objects.filter(game=game))
        # Используем ID игры как seed для стабильной случайности
        random.seed(game.id)
        random.shuffle(facts_list)
        facts = facts_list
        players = Player.objects.filter(game=game)
        return Response({
            'game': GameSerializer(game).data,
            'players': PlayerSerializer(players, many=True).data,
            'facts': FactSerializer(facts, many=True).data,
            'started': game.started,
            'ended': game.ended
        })

class RevealStoryView(views.APIView):
    def post(self, request):
        fact_id = request.data.get('fact_id')
        story = request.data.get('story')
        fact = Fact.objects.filter(id=fact_id).first()
        if not fact:
            return Response({'error': 'Fact not found.'}, status=404)
        fact.story = story
        fact.story_revealed = True
        fact.save()
        return Response(FactSerializer(fact).data)

class StatsView(views.APIView):
    def get(self, request, token):
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        players = list(Player.objects.filter(game=game))
        events = list(GuessEvent.objects.filter(fact__game=game))
        # 1. Кто чаще всех угадывал (по correct_guesser)
        from collections import Counter
        guess_counts = Counter(e.correct_guesser_id for e in events)
        best_guesser_id = guess_counts.most_common(1)[0][0] if guess_counts else None
        # 2. Чей факт был самым сложным (макс wrong_guess_count)
        hardest_event = max(events, key=lambda e: e.wrong_guess_count, default=None)
        hardest_fact_author = hardest_event.fact.author.name if hardest_event else None
        hardest_fact_text = hardest_event.fact.text if hardest_event else None
        # 3. Кто чаще всех ошибался (по wrong_guess_count на игрока)
        wrongs = Counter()
        for e in events:
            for p in players:
                if p.id != e.correct_guesser_id and p.id != e.fact.author_id:
                    wrongs[p.id] += e.wrong_guess_count
        most_wrong_id = wrongs.most_common(1)[0][0] if wrongs else None
        return Response({
            'best_guesser': next((p.name for p in players if p.id == best_guesser_id), None),
            'hardest_fact_author': hardest_fact_author,
            'hardest_fact_text': hardest_fact_text,
            'most_wrong': next((p.name for p in players if p.id == most_wrong_id), None),
        })

class EndGameView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        game.ended = True
        game.save()
        return Response({'status': 'Game ended.'})
