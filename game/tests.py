from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Game, Player, Score

class GameCreateAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_game_success(self):
        response = self.client.post('/api/game/create/', {'name': 'Тестовый ведущий'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        token = response.data['token']
        # Проверяем, что игра создана
        self.assertTrue(Game.objects.filter(token=token).exists())
        game = Game.objects.get(token=token)
        # Проверяем, что ведущий создан
        host = Player.objects.filter(game=game, is_host=True).first()
        self.assertIsNotNone(host)
        self.assertEqual(host.name, 'Тестовый ведущий')
        # Проверяем, что очки созданы
        self.assertTrue(Score.objects.filter(game=game, player=host).exists())

    def test_create_game_without_name(self):
        response = self.client.post('/api/game/create/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        token = response.data['token']
        game = Game.objects.get(token=token)
        host = Player.objects.filter(game=game, is_host=True).first()
        self.assertIsNotNone(host)
        self.assertEqual(host.name, 'Ведущий')
