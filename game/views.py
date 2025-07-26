from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Game, Player, Fact, GuessEvent, Score, LiveGuess, StoryRating, ScoreLog
from rest_framework.views import APIView
from .utils import get_client_ip, get_country_from_ip

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

from .serializers import GameSerializer, PlayerSerializer, FactSerializer, GuessEventSerializer, ScoreSerializer, LiveGuessSerializer, StoryRatingSerializer, ScoreLogSerializer
import uuid

class GameCreateView(generics.CreateAPIView):
    serializer_class = GameSerializer

    def create(self, request, *args, **kwargs):
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
        
        # Создаём игру
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = serializer.save(token=token)
        
        # Создаём ведущего сразу
        name = request.data.get('name', 'Ведущий')
        EMOJIS = [
            "🐶", "🐬", "🐭", "🐻", "🐱", "🐰", "🐴", "🐌", "🦫", "🐹",  # Приоритетные животные
            "🦁", "🐯", "🦊", "🐼", "🐸", "🐵", "🦄", "🐷", "🐨", "🦓", "🦒", "🦉", "🦅"  # Дополнительные
        ]
        used_emojis = set(Player.objects.filter(game=game).values_list('emoji', flat=True))
        available_emojis = [e for e in EMOJIS if e not in used_emojis]
        emoji = available_emojis[0] if available_emojis else "🙂"
        # Get client IP and save it
        client_ip = get_client_ip(self.request)
        player = Player.objects.create(game=game, name=name, is_host=True, emoji=emoji, ip_address=client_ip)
        Score.objects.create(player=player, game=game)
        
        # Возвращаем данные игры и созданного игрока
        return Response({
            'token': game.token,
            'player': {
                'id': player.id,
                'name': player.name,
                'emoji': player.emoji,
                'is_host': player.is_host
            }
        }, status=status.HTTP_201_CREATED)


class JoinGameView(views.APIView):
    def post(self, request):
        print(f"DEBUG: JoinGameView received data: {request.data}")
        token = request.data.get('token')
        name = request.data.get('name')
        is_host = request.data.get('is_host', False)
        
        # Нормализуем токен к нижнему регистру
        if token:
            token = token.lower().strip()
        
        print(f"DEBUG: Parsed - token: '{token}', name: '{name}', is_host: {is_host}")
        
        game = Game.objects.filter(token=token, ended=False).first()
        print(f"DEBUG: Found game: {game}")
        if not game:
            print(f"DEBUG: Game not found for token '{token}'")
            return Response({'error': 'Invalid or ended game token.'}, status=400)
        # Автоматическое назначение уникального эмоджи
        EMOJIS = [
            "🐶", "🐬", "🐭", "🐻", "🐱", "🐰", "🐴", "🐌", "🦫", "🐹",  # Приоритетные животные
            "🦁", "🐯", "🦊", "🐼", "🐸", "🐵", "🦄", "🐷", "🐨", "🦓", "🦒", "🦉", "🦅"  # Дополнительные
        ]
        used_emojis = set(Player.objects.filter(game=game).values_list('emoji', flat=True))
        available_emojis = [e for e in EMOJIS if e not in used_emojis]
        emoji = available_emojis[0] if available_emojis else "🙂"
        # Get client IP and save it
        client_ip = get_client_ip(request)
        player = Player.objects.create(game=game, name=name, is_host=is_host, emoji=emoji, ip_address=client_ip)
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
        from django.utils import timezone
        player.game.last_fact_added = timezone.now()
        player.game.save(update_fields=["last_fact_added"])
        return Response(FactSerializer(fact).data)

class SubmitLiveGuessView(views.APIView):
    def post(self, request):
        player_id = request.data.get('player_id')
        fact_id = request.data.get('fact_id')
        guessed_player_id = request.data.get('guessed_player_id')
        
        player = Player.objects.filter(id=player_id).first()
        if not player:
            return Response({'error': 'Invalid player.'}, status=400)
            
        fact = Fact.objects.filter(id=fact_id, guessed=False).first()
        if not fact:
            return Response({'error': 'Invalid or already guessed fact.'}, status=400)
            
        guessed_player = Player.objects.filter(id=guessed_player_id, game=fact.game).first()
        if not guessed_player:
            return Response({'error': 'Invalid guessed player.'}, status=400)
        
        # Check if player already guessed for this fact
        existing_guess = LiveGuess.objects.filter(fact=fact, guesser=player).first()
        if existing_guess:
            return Response({'error': 'You already made a guess for this fact.'}, status=400)
        
        # Determine if guess is correct
        is_correct = guessed_player.id == fact.author.id
        
        # Create live guess
        live_guess = LiveGuess.objects.create(
            fact=fact,
            guesser=player,
            guessed_player=guessed_player,
            is_correct=is_correct
        )
        
        # Check if this was the correct guess and trigger story phase
        if is_correct:
            fact.guessed = True
            fact.save()
            
            # Calculate wrong guesses for scoring
            wrong_guess_count = LiveGuess.objects.filter(fact=fact, is_correct=False).count()
            
            # Record traditional guess event for scoring
            GuessEvent.objects.create(
                fact=fact, 
                correct_guesser=player, 
                wrong_guess_count=wrong_guess_count
            )
            
            # Award points
            correct_score = Score.objects.get(player=player, game=fact.game)
            correct_score.points += 3
            correct_score.save()
            
            # Log correct guess points
            ScoreLog.objects.create(
                game=fact.game,
                player=player,
                points=3,
                score_type='correct_guess',
                description=f'Correct guess for fact: "{fact.text[:50]}..."',
                fact=fact
            )
            
            author_score = Score.objects.get(player=fact.author, game=fact.game)
            author_score.points += wrong_guess_count
            author_score.save()
            
            # Log wrong guess points for author
            if wrong_guess_count > 0:
                ScoreLog.objects.create(
                    game=fact.game,
                    player=fact.author,
                    points=wrong_guess_count,
                    score_type='wrong_guesses',
                    description=f'{wrong_guess_count} wrong guess{"es" if wrong_guess_count > 1 else ""} on their fact',
                    fact=fact
                )
            
            # Switch to storytelling phase
            game = fact.game
            game.game_phase = 'storytelling'
            game.story_teller = fact.author
            game.save()
            
            # Reset player story flags
            Player.objects.filter(game=game).update(has_finished_story=False, has_rated_story=False)
        
        return Response(LiveGuessSerializer(live_guess).data)

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
        
        # Получаем все факты игры
        facts = list(Fact.objects.filter(game=game))
        players = Player.objects.filter(game=game)
        
        # Текущий факт берем из базы данных
        current_fact = None
        live_guesses = []
        story_ratings = []
        if game.current_fact:
            current_fact = FactSerializer(game.current_fact).data
            # Get live guesses for current fact
            live_guesses = LiveGuess.objects.filter(fact=game.current_fact).order_by('timestamp')
            live_guesses = LiveGuessSerializer(live_guesses, many=True).data
            # Get story ratings for current fact
            story_ratings = StoryRating.objects.filter(fact=game.current_fact)
            story_ratings = StoryRatingSerializer(story_ratings, many=True).data
        
        # Get scores
        scores = Score.objects.filter(game=game)
        
        # Get recent score logs (last 20)
        score_logs = ScoreLog.objects.filter(game=game).order_by('-timestamp')[:20]
        
        return Response({
            'game': GameSerializer(game).data,
            'players': PlayerSerializer(players, many=True).data,
            'facts': FactSerializer(facts, many=True).data,
            'current_fact': current_fact,
            'live_guesses': live_guesses,
            'story_ratings': story_ratings,
            'scores': ScoreSerializer(scores, many=True).data,
            'score_logs': ScoreLogSerializer(score_logs, many=True).data,
            'started': game.started,
            'ended': game.ended,
            'game_phase': game.game_phase,
            'story_teller': PlayerSerializer(game.story_teller).data if game.story_teller else None,
            'last_fact_added': game.last_fact_added.isoformat() if game.last_fact_added else None
        })

class FinishStoryTellingView(views.APIView):
    def post(self, request):
        player_id = request.data.get('player_id')
        game_token = request.data.get('token')
        
        game = Game.objects.filter(token=game_token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
            
        player = Player.objects.filter(id=player_id, game=game).first()
        if not player:
            return Response({'error': 'Player not found.'}, status=404)
        
        # Check if player is the current story teller
        if game.story_teller != player:
            return Response({'error': 'You are not the current story teller.'}, status=403)
        
        # Mark player as finished telling story
        player.has_finished_story = True
        player.save()
        
        # Switch to rating phase
        game.game_phase = 'rating'
        game.save()
        
        # Reset all players' rating status
        Player.objects.filter(game=game).update(has_rated_story=False)
        
        return Response({'status': 'Story telling finished. Game moved to rating phase.'})

class SubmitStoryRatingView(views.APIView):
    def post(self, request):
        player_id = request.data.get('player_id')
        fact_id = request.data.get('fact_id')
        rating = request.data.get('rating')
        
        if rating not in [1, 2, 3]:
            return Response({'error': 'Rating must be 1, 2, or 3.'}, status=400)
        
        player = Player.objects.filter(id=player_id).first()
        if not player:
            return Response({'error': 'Player not found.'}, status=404)
            
        fact = Fact.objects.filter(id=fact_id).first()
        if not fact:
            return Response({'error': 'Fact not found.'}, status=404)
        
        # Don't allow author to rate their own story
        if fact.author == player:
            return Response({'error': 'You cannot rate your own story.'}, status=400)
        
        # Create or update rating
        story_rating, created = StoryRating.objects.get_or_create(
            fact=fact, 
            rater=player,
            defaults={'rating': rating}
        )
        if not created:
            story_rating.rating = rating
            story_rating.save()
        
        # Mark player as having rated
        player.has_rated_story = True
        player.save()
        
        # Check if all players (except story teller) have rated
        game = fact.game
        players_count = game.players.count()
        rated_count = game.players.filter(has_rated_story=True).count()
        
        # If everyone has rated, calculate final score and move to next fact
        if rated_count >= (players_count - 1):  # -1 because story teller doesn't rate
            # Calculate average rating
            ratings = StoryRating.objects.filter(fact=fact)
            if ratings.exists():
                avg_rating = sum(r.rating for r in ratings) / ratings.count()
                fact.story_rating_average = avg_rating
                fact.story_rating_count = ratings.count()
                
                # Award story points to author (rounded average)
                story_points = round(avg_rating)
                author_score = Score.objects.get(player=fact.author, game=game)
                author_score.points += story_points
                author_score.save()
                
                # Log story rating points
                ScoreLog.objects.create(
                    game=game,
                    player=fact.author,
                    points=story_points,
                    score_type='story_rating',
                    description=f'Story rating: {avg_rating:.1f}/3.0 stars (rounded to {story_points} pts)',
                    fact=fact
                )
                
                fact.save()
            
            # Reset game phase and move to next fact
            game.game_phase = 'guessing'
            game.story_teller = None
            
            # Auto-select next fact if there are unguessed facts left
            unguessed_facts = Fact.objects.filter(game=game, guessed=False)
            if unguessed_facts.exists():
                import random
                next_fact = random.choice(unguessed_facts)
                game.current_fact = next_fact
            else:
                game.current_fact = None
                game.ended = True
            
            game.save()
            
            # Reset player flags for next round
            Player.objects.filter(game=game).update(has_finished_story=False, has_rated_story=False)
        
        return Response(StoryRatingSerializer(story_rating).data)

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
        
        # 4. Самый загадочный (чьи факты набрали больше всего баллов)
        author_points = Counter()
        for e in events:
            author_points[e.fact.author_id] += e.wrong_guess_count
        most_mysterious_id = author_points.most_common(1)[0][0] if author_points else None
        
        # 5. Ленивый (чьи факты угадывали быстрее всего - меньше всего ошибок)
        author_wrongs = Counter()
        author_facts_count = Counter()
        for e in events:
            author_wrongs[e.fact.author_id] += e.wrong_guess_count
            author_facts_count[e.fact.author_id] += 1
        
        # Считаем средние ошибки на факт для каждого автора
        avg_wrongs = {}
        for author_id in author_facts_count:
            if author_facts_count[author_id] > 0:
                avg_wrongs[author_id] = author_wrongs[author_id] / author_facts_count[author_id]
        
        laziest_id = min(avg_wrongs.keys(), key=lambda x: avg_wrongs[x]) if avg_wrongs else None
        
        return Response({
            'best_guesser': next((p.name for p in players if p.id == best_guesser_id), None),
            'hardest_fact_author': hardest_fact_author,
            'hardest_fact_text': hardest_fact_text,
            'most_wrong': next((p.name for p in players if p.id == most_wrong_id), None),
            'most_mysterious': next((p.name for p in players if p.id == most_mysterious_id), None),
            'laziest': next((p.name for p in players if p.id == laziest_id), None),
        })

class KickPlayerView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        player_id = request.data.get('player_id')
        requester_id = request.data.get('requester_id')
        
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
            
        # Проверяем, что запрос от ведущего
        requester = Player.objects.filter(id=requester_id, game=game, is_host=True).first()
        if not requester:
            return Response({'error': 'Only host can kick players.'}, status=403)
            
        # Находим игрока для кика
        player_to_kick = Player.objects.filter(id=player_id, game=game).first()
        if not player_to_kick:
            return Response({'error': 'Player not found.'}, status=404)
            
        if player_to_kick.is_host:
            return Response({'error': 'Cannot kick host.'}, status=400)
            
        # Удаляем игрока и его факты
        Fact.objects.filter(author=player_to_kick).delete()
        Score.objects.filter(player=player_to_kick).delete()
        player_to_kick.delete()
        
        return Response({'status': 'Player kicked successfully.'})

class AnalyticsView(views.APIView):
    def get(self, request):
        from django.db.models import Count, Avg
        from django.utils import timezone
        from datetime import timedelta
        import datetime
        
        # Базовая статистика
        total_games = Game.objects.count()
        total_players = Player.objects.count()
        
        # Средние показатели
        avg_players_per_game = Player.objects.values('game').annotate(count=Count('id')).aggregate(avg=Avg('count'))['avg'] or 0
        
        # Статистика по времени
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        games_this_week = Game.objects.filter(created_at__gte=week_ago).count()
        games_this_month = Game.objects.filter(created_at__gte=month_ago).count()
        
        # Самый активный день недели
        from collections import Counter
        games_by_weekday = Game.objects.all().values_list('created_at', flat=True)
        weekday_counts = Counter()
        for created_at in games_by_weekday:
            weekday_counts[created_at.strftime('%A')] += 1
        
        most_active_day = weekday_counts.most_common(1)[0][0] if weekday_counts else 'N/A'
        
        # Средняя длительность игры (приблизительно) - пока не можем точно измерить без updated_at поля
        # Для упрощения используем примерную оценку на основе количества завершенных игр
        completed_games_count = Game.objects.filter(ended=True).count()
        avg_duration_minutes = 15.0 if completed_games_count > 0 else 0  # примерная оценка
        
        # Get recent games with country information
        recent_games = []
        for game in Game.objects.order_by('-created_at')[:10]:
            # Get unique countries from players in this game
            players_with_countries = []
            for player in game.players.all():
                if player.ip_address:
                    country_info = get_country_from_ip(player.ip_address)
                    players_with_countries.append({
                        'name': player.name,
                        'country_code': country_info['country_code'],
                        'country_name': country_info['country_name'],
                        'flag': country_info['flag']
                    })
                else:
                    players_with_countries.append({
                        'name': player.name,
                        'country_code': 'UNKNOWN',
                        'country_name': 'Unknown',
                        'flag': '🌍'
                    })
            
            # Get unique countries for this game
            unique_countries = {}
            for player_info in players_with_countries:
                country_code = player_info['country_code']
                if country_code not in unique_countries:
                    unique_countries[country_code] = {
                        'code': country_code,
                        'name': player_info['country_name'],
                        'flag': player_info['flag'],
                        'count': 0
                    }
                unique_countries[country_code]['count'] += 1
            
            recent_games.append({
                'token': game.token,
                'created_at': game.created_at,
                'started': game.started,
                'ended': game.ended,
                'player_count': game.players.count(),
                'countries': list(unique_countries.values())
            })
        
        return Response({
            'total_games': total_games,
            'total_players': total_players,
            'avg_players_per_game': round(avg_players_per_game, 1),
            'avg_game_duration_minutes': round(avg_duration_minutes, 1),
            'most_active_day': most_active_day,
            'games_this_week': games_this_week,
            'games_this_month': games_this_month,
            'recent_games': recent_games
        })

class SetCurrentFactView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        fact_id = request.data.get('fact_id')
        
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        
        # Only allow setting facts during guessing phase
        if game.game_phase != 'guessing':
            return Response({'error': 'Can only set current fact during guessing phase.'}, status=400)
        
        # Если fact_id None, сбрасываем текущий факт
        if fact_id is None:
            game.current_fact = None
        else:
            # Проверяем, что факт существует и принадлежит игре
            fact = Fact.objects.filter(id=fact_id, game=game, guessed=False).first()
            if not fact:
                return Response({'error': 'Fact not found or already guessed.'}, status=404)
            game.current_fact = fact
        
        game.save()
        return Response({'status': 'Current fact updated.', 'current_fact_id': fact_id})

class EndGameView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        game = Game.objects.filter(token=token).first()
        if not game:
            return Response({'error': 'Game not found.'}, status=404)
        game.ended = True
        game.save()
        return Response({'status': 'Game ended.'})
