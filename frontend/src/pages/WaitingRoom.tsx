import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getGameState, startGame, kickPlayer } from "../api";
import { useLanguage } from "../contexts/LanguageContext";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import BackToMenuButton from "../components/BackToMenuButton";

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem("token") || "";
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "";
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
  const [players, setPlayers] = useState<any[]>([]);
  const [allFactsReady, setAllFactsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [facts, setFacts] = useState<any[]>([]);
  const { t } = useLanguage();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Polling for players in room
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!token) return;
    let interval = setInterval(async () => {
      try {
        const state = await getGameState(token);
        setPlayers(state.players || []);
        setGameStarted(!!state.started);
        setFacts(state.facts || []);
        // DEBUG: показываем состояние игры
        console.log("WaitingRoom polling:", { started: state.started, role, name });
        // Проверяем, у всех ли игроков есть 3 факта
        const factsPerPlayer: Record<number, number> = {};
        (state.facts || []).forEach((f: any) => {
          if (!factsPerPlayer[f.author]) factsPerPlayer[f.author] = 0;
          factsPerPlayer[f.author]++;
        });
        const allReady = (state.players || []).every((p: any) => factsPerPlayer[p.id] === 3);
        setAllFactsReady(allReady);
        if (state.started) {
          console.log("Game started, navigating to /round");
          navigate("/round");
        }
      } catch (e) {
        setError("Ошибка загрузки игроков");
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startGame(token);
      // После старта сразу переходим в раунд
      navigate("/round");
    } catch {
      setError("Ошибка запуска игры");
    }
    setLoading(false);
  };

  const handleKickPlayer = async (playerId: number) => {
    if (!currentPlayer.is_host) {
      showError("Only host can kick players");
      return;
    }
    
    try {
      await kickPlayer(token, playerId, currentPlayer.id);
      showSuccess("Player kicked successfully");
      // Обновляем список игроков
      const data = await getGameState(token);
      setPlayers(data.players);
      setFacts(data.facts);
    } catch (err) {
      showError("Error kicking player");
    }
  };

  return (
    <div className="app-container">
      <BackToMenuButton />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>{t('waiting.title')}</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>{t('waiting.code')} {token}</strong>
      </div>
      <div className="players-list">
        {players.map((p: any) => {
          // Определяем статус игрока на основе количества фактов
          const playerFactsCount = facts.filter((f: any) => f.author === p.id).length;
          const isReady = playerFactsCount >= 3;
          const statusEmoji = isReady ? "✅" : "⏳";
          const statusText = isReady ? t('waiting.ready') : t('waiting.notReady');
          const isCurrentUser = p.id === currentPlayer.id;
          
          return (
            <div key={p.id} className="player-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', margin: '4px 0', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{fontSize: 24}}>{p.emoji || "🙂"}</span>
                <span style={{ color: '#111' }}>{p.name}</span>
                {p.is_host && isCurrentUser ? <span style={{ color: '#333', fontWeight: 'bold' }}> 👑 ({t('waiting.you')})</span> : p.is_host ? " 👑" : isCurrentUser ? <span style={{ color: '#333', fontWeight: 'bold' }}> ({t('waiting.you')})</span> : ""}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                <span>{statusEmoji}</span>
                <span style={{ color: isReady ? '#4CAF50' : '#FF9800' }}>{statusText}</span>
                {/* Кнопка кика для ведущего */}
                {currentPlayer.is_host && !p.is_host && (
                  <button
                    onClick={() => handleKickPlayer(p.id)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}
                    title="Kick player"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {role === "host" && players.length >= 2 && !gameStarted && (
        <button className="primary" onClick={handleStart} disabled={!allFactsReady || loading}>
          {t('waiting.startGame')}
        </button>
      )}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
