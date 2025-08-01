import { useEffect, useState } from "react";
import { getScoreboard, getGameState, endGame } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";
import PlayerKickButton from "../components/PlayerKickButton";

export default function Scoreboard() {
  const token = localStorage.getItem("token") || "";
  const [scores, setScores] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const getPlayerFromStorage = () => {
    try {
      const playerData = localStorage.getItem("player");
      return playerData ? JSON.parse(playerData) : {};
    } catch (error) {
      console.error('Error parsing player data from localStorage:', error);
      return {};
    }
  };
  const currentPlayer = getPlayerFromStorage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scoresData, gameState] = await Promise.all([
          getScoreboard(token),
          getGameState(token)
        ]);
        setScores(scoresData);
        setPlayers(gameState.players || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [token]);

  const handlePlayerKicked = async () => {
    // Refresh data after kicking a player
    try {
      const [scoresData, gameState] = await Promise.all([
        getScoreboard(token),
        getGameState(token)
      ]);
      setScores(scoresData);
      setPlayers(gameState.players || []);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>🏆 Таблица очков</h2>
      
      {/* Host management panel */}
      {currentPlayer.is_host && players.length > 1 && (
        <div className="host-management-panel" style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px',
          margin: '16px 0',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>👑 Host Controls</h4>
          <div className="player-management">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {players
                .filter((p: any) => !p.is_host)
                .map((p: any) => (
                  <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '16px',
                    border: '1px solid #ddd',
                    fontSize: '12px'
                  }}>
                    <PlayerKickButton
                      player={p}
                      currentPlayer={currentPlayer}
                      token={token}
                      onKick={handlePlayerKicked}
                      showSuccess={showSuccess}
                      showError={showError}
                      compact={true}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <ul>
        {scores.map((s, i) => (
          <li key={s.id || i}>
            {s.player_emoji || "🧑"} <b>{s.player_name}</b>: ⭐ {s.points}
          </li>
        ))}
      </ul>
      {currentPlayer.is_host ? (
        <button onClick={async () => {
          if (confirm("Are you sure you want to end the game? This will show final results and statistics.")) {
            try {
              await endGame(token, currentPlayer.id);
              navigate("/end");
            } catch (error: any) {
              console.error("Error ending game:", error);
            }
          }
        }}>🏁 Завершить игру</button>
      ) : (
        <button onClick={() => navigate("/end")}>🏁 Завершить игру</button>
      )}
    </div>
  );
}
