import { useEffect, useState } from "react";
import { getGameState, sendGuessEvent } from "../api";
import { useNavigate } from "react-router-dom";

export default function GameRound() {
  const token = localStorage.getItem("token") || "";
  const player = JSON.parse(localStorage.getItem("player") || "{}");
  const [facts, setFacts] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [correctGuesser, setCorrectGuesser] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameData = async () => {
      try {
        console.log("GameRound: Loading game state for player:", player);
        const data = await getGameState(token);
        console.log("GameRound: Game state received:", data);
        const unguessed = data.facts.filter((f: any) => !f.guessed);
        console.log("GameRound: All facts:", data.facts);
        console.log("GameRound: Unguessed facts:", unguessed);
        console.log("GameRound: Current fact will be set to:", unguessed[0] || null);
        setFacts(unguessed);
        setCurrent(unguessed[0] || null);
        setPlayers(data.players);
        
        // Обновляем таблицу очков
        const scoresData = await fetch(`/api/game/scoreboard/${token}/`).then(r => r.json());
        setScores(scoresData);
        
        // Отмечаем, что данные загружены
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading game data:", error);
        setDataLoaded(true); // Даже при ошибке отмечаем как загруженное
      }
    };

    // Загружаем данные сразу
    loadGameData();
    
    // Для участников (не ведущих) добавляем polling каждые 3 секунды
    let interval: number | null = null;
    if (!player.is_host) {
      interval = setInterval(loadGameData, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, player.id, player.is_host]);

  const handleNext = async () => {
    const idx = facts.indexOf(current);
    setCurrent(facts[idx + 1] || null);
    setWrongGuesses(0);
    setCorrectGuesser("");
    setResult("");
    
    // Обновляем данные игры для ведущего, чтобы обновить счетчик
    if (player.is_host) {
      try {
        const data = await getGameState(token);
        const unguessed = data.facts.filter((f: any) => !f.guessed);
        setFacts(unguessed);
        // Обновляем current на основе обновленного списка
        setCurrent(unguessed[0] || null);
      } catch (error) {
        console.error("Error updating game data for host:", error);
      }
    }
  };

  const handleResult = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const correctPlayerId = Number(correctGuesser);
      await sendGuessEvent(current.id, correctPlayerId, wrongGuesses);
      // Обновляем таблицу очков после сохранения результата
      const updatedScores = await fetch(`/api/game/scoreboard/${token}/`).then(r => r.json());
      setScores(updatedScores);
      setResult("Результат сохранён!");
      setTimeout(handleNext, 1000);
    } catch {
      alert("Ошибка отправки результата");
    }
    setLoading(false);
  };

  // Показываем загрузку, пока данные не загружены
  if (!dataLoaded) {
    return (
      <div className="app-container">
        <h2>⏳ Загрузка игры...</h2>
      </div>
    );
  }

  // Только после загрузки проверяем, есть ли вопросы
  if (!current) {
    console.log("GameRound: No current fact after data loaded! Facts array:", facts, "Current:", current);
    // Автоматически переходим к финальному экрану для всех игроков
    setTimeout(() => navigate("/end"), 1000);
    return (
      <div className="app-container">
        <h2>🎉 Раунды завершены! 🎉</h2>
        <p>Переходим к результатам...</p>
      </div>
    );
  }

  // Сколько осталось вопросов
  const questionsLeft = facts.length;

  // Таблица очков
  const scoreboard = (
    <div style={{ margin: "18px 0" }}>
      <h3>🏆 Таблица очков</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {scores.map((s: any) => (
          <li key={s.id}>
            {s.player_emoji || "🧑"} <b>{s.player_name || players.find((p: any) => p.id === s.player)?.name || s.player}</b>: {s.points}
          </li>
        ))}
      </ul>
    </div>
  );

  // Для ведущего — выбор угадавшего, для остальных — просто инфо
  const isHost = player.is_host;
  const canPickGuesser = isHost && players.length > 0;
  const guesserSelect = canPickGuesser ? (
    <>
      <label>🎯 Кто угадал правильно?</label>
      <select value={correctGuesser} onChange={e => setCorrectGuesser(e.target.value)}>
        <option value="">Выберите игрока</option>
        {players.filter((p: any) => p.id !== current.author).map((p: any) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <label>❌ Сколько было неверных попыток?</label>
      <input type="number" value={wrongGuesses} onChange={e => setWrongGuesses(Number(e.target.value))} />
      <button onClick={handleResult} disabled={loading || !correctGuesser}>
        {loading ? "💾 Сохраняю..." : "✅ Сохранить результат"}
      </button>
      {result && <div className="center">🎉 {result}</div>}
    </>
  ) : null;

  return (
    <div className="app-container">
      <h2>Угадай, кто написал:</h2>
      <div style={{ margin: "20px 0", fontSize: "1.2em", color: "#7ed957" }}>
        "{current.text}"
      </div>
      <div style={{ marginBottom: 10 }}>📝 Осталось вопросов: <b>{questionsLeft}</b></div>
      {isHost ? guesserSelect : <div style={{ margin: "10px 0" }}>Ожидаем решения ведущего...</div>}
      {scoreboard}
    </div>
  );
}

