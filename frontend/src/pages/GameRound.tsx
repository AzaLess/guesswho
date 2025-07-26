import { useEffect, useState } from "react";
import { getGameState, submitFact, submitLiveGuess, finishStoryTelling, submitStoryRating, setCurrentFact } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import SoundToggle from "../components/SoundToggle";
import { playCorrectAnswer, playWrongAnswer, playNextRound, playNewFact } from "../utils/sounds";
import BackToMenuButton from "../components/BackToMenuButton";
import GameStats from "../components/GameStats";

export default function GameRound() {
  const token = localStorage.getItem("token") || "";
  const getPlayerFromStorage = () => {
    try {
      const playerData = localStorage.getItem("player");
      return playerData ? JSON.parse(playerData) : {};
    } catch (error) {
      console.error('Error parsing player data from localStorage:', error);
      return {};
    }
  };
  const player = getPlayerFromStorage();
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [storyRating, setStoryRating] = useState<number | null>(null);
  const [showAddFact, setShowAddFact] = useState(false);
  const [newFact, setNewFact] = useState("");
  const [addingFact, setAddingFact] = useState(false);
  // Remove local scoreLog as we get it from API
  
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const data = await getGameState(token);
        console.log("GameRound: Game state received:", data);
        
        // If game ended, go to end screen
        if (data.ended) {
          navigate("/end");
          return;
        }
        
        setGameState(data);
      } catch (error) {
        console.error("Error loading game data:", error);
        showError('Failed to load game data');
      }
    };

    loadGameData();
    const interval = setInterval(loadGameData, 2000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, navigate, showError]);

  // Reset story rating when current fact changes
  useEffect(() => {
    if (gameState?.current_fact) {
      setStoryRating(null);
    }
  }, [gameState?.current_fact?.id]);

  // Score tracking is now handled by backend ScoreLog

  const handleGuess = async (guessedPlayerId: number) => {
    if (!gameState?.current_fact) return;
    
    setLoading(true);
    try {
      await submitLiveGuess(player.id, gameState.current_fact.id, guessedPlayerId);
      showSuccess('Guess submitted!');
      playCorrectAnswer();
    } catch (error: any) {
      console.error("Error submitting guess:", error);
      showError(error.response?.data?.error || 'Failed to submit guess');
      playWrongAnswer();
    }
    setLoading(false);
  };

  const handleFinishStory = async () => {
    setLoading(true);
    try {
      await finishStoryTelling(player.id, token);
      showSuccess('Story finished! Moving to rating phase.');
    } catch (error: any) {
      console.error("Error finishing story:", error);
      showError(error.response?.data?.error || 'Failed to finish story');
    }
    setLoading(false);
  };

  const handleRateStory = async (rating: number) => {
    if (!gameState?.current_fact) return;
    
    setLoading(true);
    try {
      await submitStoryRating(player.id, gameState.current_fact.id, rating);
      setStoryRating(rating);
      showSuccess('Rating submitted!');
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      showError(error.response?.data?.error || 'Failed to submit rating');
    }
    setLoading(false);
  };

  const handleAddFact = async () => {
    if (!newFact.trim()) return showError("Enter a fact!");
    setAddingFact(true);
    try {
      await submitFact(player.id, newFact);
      setNewFact("");
      setShowAddFact(false);
      showSuccess("Fact added!");
      playNewFact();
    } catch {
      showError("Error adding fact");
    }
    setAddingFact(false);
  };

  const handleStartNewRound = async () => {
    if (!gameState?.facts) return;
    
    const unguessedFacts = gameState.facts.filter((f: any) => !f.guessed);
    if (unguessedFacts.length === 0) {
      navigate("/end");
      return;
    }
    
    try {
      const randomFact = unguessedFacts[Math.floor(Math.random() * unguessedFacts.length)];
      await setCurrentFact(token, randomFact.id);
      showSuccess('New round started!');
      playNextRound();
    } catch (error) {
      console.error("Error starting new round:", error);
      showError('Failed to start new round');
    }
  };

  if (!gameState) {
    return (
      <div className="app-container">
        <h2>⏳ Loading game...</h2>
      </div>
    );
  }

  const { players, facts, current_fact, live_guesses, story_ratings, scores, score_logs, game_phase, story_teller } = gameState;
  const unguessedFacts = facts.filter((f: any) => !f.guessed);
  
  // Merge players with their scores
  const playersWithScores = players.map((player: any) => ({
    ...player,
    scores: scores ? scores.filter((s: any) => s.player === player.id) : []
  }));

  // If no current fact during guessing phase, show start round button
  if (!current_fact && game_phase === 'guessing') {
    return (
      <div className="app-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SoundToggle />
        <BackToMenuButton />
        <h2>🎮 Ready for Next Round?</h2>
        <p>Questions remaining: <b>{unguessedFacts.length}</b></p>
        {unguessedFacts.length > 0 ? (
          <button onClick={handleStartNewRound} className="btn-primary">
            Start New Round
          </button>
        ) : (
          <div>
            <p>🎉 No more questions! Game ending...</p>
            <button onClick={() => navigate("/end")} className="btn-primary">
              View Final Results
            </button>
          </div>
        )}
        
        <GameStats 
          players={playersWithScores}
          facts={facts}
          scoreLog={score_logs || []}
        />
      </div>
    );
  }

  // Guessing Phase
  if (game_phase === 'guessing' && current_fact) {
    const playerAlreadyGuessed = live_guesses.some((guess: any) => guess.guesser === player.id);
    const availablePlayers = players; // Show all players
    
    // Get players who were incorrectly guessed (and should be disabled)
    const incorrectlyGuessedPlayers = live_guesses
      .filter((guess: any) => guess.is_correct === false)
      .map((guess: any) => guess.guessed_player);

    return (
      <div className="app-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SoundToggle />
        <BackToMenuButton />
        <h2>🎯 Guessing Phase</h2>
        
        <div className="fact-display">
          <h3>"{current_fact.text}"</h3>
        </div>

        <div className="questions-left">
          Questions remaining: <b>{unguessedFacts.length}</b>
        </div>

        {!playerAlreadyGuessed ? (
          <div className="guessing-section">
            <h4>Who do you think wrote this fact?</h4>
            <div className="player-buttons">
              {availablePlayers.map((p: any) => {
                const isSelf = p.id === player.id;
                const isEliminated = incorrectlyGuessedPlayers.includes(p.id);
                const isDisabled = loading || isSelf || isEliminated;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && handleGuess(p.id)}
                    disabled={isDisabled}
                    className={`player-btn ${isSelf ? 'disabled-self' : ''} ${isEliminated ? 'eliminated' : ''}`}
                    title={
                      isSelf ? "You can't vote for yourself" : 
                      isEliminated ? "This player was already incorrectly guessed" : ""
                    }
                  >
                    {p.emoji} {p.name} 
                    {isSelf ? ' (You)' : ''}
                    {isEliminated ? ' ❌' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="waiting-section">
            <p>✅ You've made your guess! Waiting for others...</p>
          </div>
        )}

        {/* Live Guesses Feed */}
        <div className="live-guesses">
          <h4>🔥 Live Guesses</h4>
          {live_guesses.length === 0 ? (
            <p>No guesses yet...</p>
          ) : (
            <div className="guess-feed">
              {live_guesses.map((guess: any) => (
                <div key={guess.id} className="guess-item">
                  <span className="guesser">{guess.guesser_emoji} {guess.guesser_name}</span>
                  <span> → </span>
                  <span className="guessed">{guess.guessed_player_emoji} {guess.guessed_player_name}</span>
                  <span className="result">
                    {guess.is_correct === null ? "⏳" : guess.is_correct ? "✅" : "❌"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Fact Section */}
        <div className="add-fact-section">
          {!showAddFact ? (
            <button onClick={() => setShowAddFact(true)} className="btn-secondary">
              ➕ Add New Fact
            </button>
          ) : (
            <div className="add-fact-form">
              <h4>Add a New Fact</h4>
              <input 
                type="text" 
                value={newFact} 
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="Enter an interesting fact about yourself..."
                className="fact-input"
              />
              <div className="form-buttons">
                <button 
                  onClick={handleAddFact} 
                  disabled={addingFact || !newFact.trim()}
                  className="btn-primary"
                >
                  {addingFact ? 'Adding...' : 'Add Fact'}
                </button>
                <button 
                  onClick={() => { setShowAddFact(false); setNewFact(""); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <GameStats 
          players={playersWithScores}
          facts={facts}
          scoreLog={score_logs || []}
        />
      </div>
    );
  }

  // Story Telling Phase
  if (game_phase === 'storytelling' && story_teller) {
    const isStoryTeller = story_teller.id === player.id;
    const correctGuesser = live_guesses.find((guess: any) => guess.is_correct);

    return (
      <div className="app-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SoundToggle />
        <BackToMenuButton />
        <h2>📖 Story Time!</h2>
        
        <div className="fact-display">
          <h3>"{current_fact.text}"</h3>
        </div>

        {correctGuesser && (
          <div className="correct-guess-announcement">
            <p>🎉 <b>{correctGuesser.guesser_emoji} {correctGuesser.guesser_name}</b> correctly guessed that <b>{story_teller.emoji} {story_teller.name}</b> wrote this fact!</p>
          </div>
        )}

        {isStoryTeller ? (
          <div className="storyteller-section">
            <h4>🎭 You're the storyteller!</h4>
            <p>Tell everyone the story behind your fact. When you're done, click the button below.</p>
            <button 
              onClick={handleFinishStory}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Processing...' : "I finished telling my story"}
            </button>
          </div>
        ) : (
          <div className="listener-section">
            <h4>👂 Listen to the story</h4>
            <p>
              <b>{story_teller.emoji} {story_teller.name}</b> is telling the story behind their fact.
            </p>
            <p>Get ready to rate the story!</p>
          </div>
        )}
        
        <GameStats 
          players={playersWithScores}
          facts={facts}
          scoreLog={score_logs || []}
        />
      </div>
    );
  }

  // Story Rating Phase
  if (game_phase === 'rating' && current_fact) {
    const isAuthor = current_fact.author === player.id;
    const playerRatings = story_ratings || [];
    const hasRatedInDB = playerRatings.some((rating: any) => rating.rater === player.id);
    const hasRated = storyRating !== null || hasRatedInDB;
    const eligibleVoters = players.filter((p: any) => p.id !== current_fact.author);
    const averageRating = current_fact.story_rating_average;

    return (
      <div className="app-container">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SoundToggle />
        <BackToMenuButton />
        <h2>⭐ Rate the Story</h2>
        
        <div className="fact-display">
          <h3>"{current_fact.text}"</h3>
        </div>

        {/* Show voting status */}
        <div className="voting-status">
          <h4>📊 Voting Status</h4>
          <div className="voter-list">
            {eligibleVoters.map((p: any) => {
              const hasVoted = playerRatings.some((rating: any) => rating.rater === p.id);
              return (
                <div key={p.id} className={`voter-item ${hasVoted ? 'voted' : 'not-voted'}`}>
                  <span>{p.emoji} {p.name}</span>
                  <span className="vote-indicator">{hasVoted ? '✅' : '⏳'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {averageRating !== null && averageRating !== undefined ? (
          <div className="final-rating">
            <h4>🏆 Final Rating: {averageRating.toFixed(1)} / 3.0 stars</h4>
            <p>Based on {current_fact.story_rating_count} vote{current_fact.story_rating_count !== 1 ? 's' : ''}</p>
          </div>
        ) : isAuthor ? (
          <div className="author-waiting">
            <h4>⏳ Waiting for ratings...</h4>
            <p>Other players are rating your story. Results will be shown shortly!</p>
          </div>
        ) : hasRated ? (
          <div className="rated-section">
            <h4>✅ Rating submitted!</h4>
            {(() => {
              const myRating = storyRating || playerRatings.find((r: any) => r.rater === player.id)?.rating;
              return <p>You rated this story: <b>{myRating} star{myRating !== 1 ? 's' : ''}</b></p>;
            })()}
            <p>Waiting for other players to rate...</p>
          </div>
        ) : (
          <div className="rating-section">
            <h4>How was the story?</h4>
            <div className="rating-buttons">
              <button 
                onClick={() => handleRateStory(1)}
                disabled={loading}
                className="rating-btn boring"
              >
                😴 Boring (1 star)
              </button>
              <button 
                onClick={() => handleRateStory(2)}
                disabled={loading}
                className="rating-btn good"
              >
                👍 Good (2 stars)
              </button>
              <button 
                onClick={() => handleRateStory(3)}
                disabled={loading}
                className="rating-btn amazing"
              >
                🤩 Amazing (3 stars)
              </button>
            </div>
          </div>
        )}
        
        <GameStats 
          players={playersWithScores}
          facts={facts}
          scoreLog={score_logs || []}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>⏳ Loading...</h2>
      
      {gameState && (
        <GameStats 
          players={playersWithScores || []}
          facts={facts || []}
          scoreLog={scoreLog}
        />
      )}
    </div>
  );
}