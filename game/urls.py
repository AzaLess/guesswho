from django.urls import path
from .views import (
    GameCreateView, JoinGameView, FactSubmitView, HostGuessEventView, 
    ScoreboardView, GameStateView, RevealStoryView, EndGameView, StatsView, StartGameView
)

urlpatterns = [
    path('create/', GameCreateView.as_view(), name='game-create'),
    path('join/', JoinGameView.as_view(), name='game-join'),
    path('submit_fact/', FactSubmitView.as_view(), name='fact-submit'),
    path('guess_event/', HostGuessEventView.as_view(), name='host-guess-event'),
    path('scoreboard/<str:token>/', ScoreboardView.as_view(), name='scoreboard'),
    path('state/<str:token>/', GameStateView.as_view(), name='game-state'),
    path('reveal_story/', RevealStoryView.as_view(), name='reveal-story'),
    path('end/', EndGameView.as_view(), name='end-game'),
    path('stats/<str:token>/', StatsView.as_view(), name='game-stats'),
    path('start/', StartGameView.as_view(), name='game-start'),
]
