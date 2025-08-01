import { useState } from 'react';

interface GameStatsProps {
  players: any[];
  facts: any[];
  scoreLog?: any[];
  showRemainingFacts?: () => void;
}

export default function GameStats({ players, facts, scoreLog = [], showRemainingFacts }: GameStatsProps) {
  // Check if current user is host - we'll get this from localStorage to match GameRound pattern
  const getPlayerFromStorage = () => {
    try {
      const playerData = localStorage.getItem("player");
      return playerData ? JSON.parse(playerData) : {};
    } catch (error) {
      return {};
    }
  };
  const currentPlayer = getPlayerFromStorage();
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
      <div className="stats-controls" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button 
          className="stats-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          📊 Stats {isExpanded ? '▼' : '▲'}
        </button>
        
        {showRemainingFacts && currentPlayer.is_host && (
          <button 
            className="stats-toggle"
            onClick={showRemainingFacts}
            style={{
              background: 'linear-gradient(135deg, #17a2b8, #138496)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
          >
            📝 Facts ({unguessedFacts.length})
          </button>
        )}
      </div>
      
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