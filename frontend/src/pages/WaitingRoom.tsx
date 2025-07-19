import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getGameState, startGame } from "../api";

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem("token") || "";
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "";
  const [players, setPlayers] = useState<any[]>([]);
  const [allFactsReady, setAllFactsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Polling for players in room
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!token) return;
    let interval = setInterval(async () => {
      try {
        const state = await getGameState(token);
        setPlayers(state.players || []);
        setGameStarted(!!state.started);
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

  return (
    <div className="app-container">
      <h2>⏳ Ожидание участников</h2>
      <p>🔑 Код комнаты: <b>{token}</b></p>
      <div className="players-list">
        {players.map((p: any) => (
          <div key={p.id} className="player-item">
            <span style={{fontSize: 24}}>{p.emoji || "🙂"}</span> {p.name}
            {p.is_host && p.name === name ? " 👑 (Вы)" : p.is_host ? " 👑" : ""}
          </div>
        ))}
      </div>
      {role === "host" && players.length >= 2 && !gameStarted && (
        <button className="primary" onClick={handleStart} disabled={!allFactsReady || loading}>
          🚦 Начать игру
        </button>
      )}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
