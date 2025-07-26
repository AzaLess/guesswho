from django.urls import path
from .views import (
    GameCreateView, JoinGameView, FactSubmitView, SubmitLiveGuessView, 
    ScoreboardView, GameStateView, FinishStoryTellingView, SubmitStoryRatingView, 
    EndGameView, StatsView, StartGameView, KickPlayerView, AnalyticsView, SetCurrentFactView
)

urlpatterns = [
    path('create/', GameCreateView.as_view(), name='game-create'),
    path('join/', JoinGameView.as_view(), name='game-join'),
    path('submit_fact/', FactSubmitView.as_view(), name='fact-submit'),
    path('submit_live_guess/', SubmitLiveGuessView.as_view(), name='submit-live-guess'),
    path('finish_story/', FinishStoryTellingView.as_view(), name='finish-story'),
    path('submit_story_rating/', SubmitStoryRatingView.as_view(), name='submit-story-rating'),
    path('scoreboard/<str:token>/', ScoreboardView.as_view(), name='scoreboard'),
    path('state/<str:token>/', GameStateView.as_view(), name='game-state'),
    path('end/', EndGameView.as_view(), name='end-game'),
    path('stats/<str:token>/', StatsView.as_view(), name='game-stats'),
    path('start/', StartGameView.as_view(), name='game-start'),
    path('kick/', KickPlayerView.as_view(), name='kick-player'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('set_current_fact/', SetCurrentFactView.as_view(), name='set-current-fact'),
]