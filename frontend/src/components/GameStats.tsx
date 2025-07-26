import { useState } from 'react';

interface GameStatsProps {
  players: any[];
  facts: any[];
  scoreLog?: any[];
}

export default function GameStats({ players, facts, scoreLog = [] }: GameStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const guessedFacts = facts.filter(f => f.guessed);
  const unguessedFacts = facts.filter(f => !f.guessed);
  
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = a.scores?.[0]?.points || 0;
    const scoreB = b.scores?.[0]?.points || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="game-stats">
      <button 
        className="stats-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        📊 Stats {isExpanded ? '▼' : '▲'}
      </button>
      
      {isExpanded && (
        <div className="stats-content">
          {/* Game Progress */}
          <div className="stats-section">
            <h4>🎮 Game Progress</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Facts Guessed:</span>
                <span className="stat-value">{guessedFacts.length}/{facts.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Remaining:</span>
                <span className="stat-value">{unguessedFacts.length}</span>
              </div>
            </div>
          </div>

          {/* Current Standings */}
          <div className="stats-section">
            <h4>🏆 Current Standings</h4>
            <div className="leaderboard">
              {sortedPlayers.map((player, index) => {
                const score = player.scores?.[0]?.points || 0;
                return (
                  <div key={player.id} className={`leaderboard-item ${index === 0 ? 'leader' : ''}`}>
                    <span className="position">{index + 1}.</span>
                    <span className="player-info">
                      {player.emoji} {player.name}
                      {player.is_host ? ' 👑' : ''}
                    </span>
                    <span className="score">{score} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Score Changes */}
          {scoreLog.length > 0 && (
            <div className="stats-section">
              <h4>📝 Recent Score Changes</h4>
              <div className="score-log">
                {scoreLog.slice(0, 10).map((log, index) => (
                  <div key={log.id || index} className="log-item">
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="log-player">{log.player_emoji} {log.player_name}</span>
                    <span className={`log-points ${log.points > 0 ? 'positive' : 'negative'}`}>
                      {log.points > 0 ? '+' : ''}{log.points} pts
                    </span>
                    <span className="log-reason">{log.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}