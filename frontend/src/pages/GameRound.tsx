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
  const navigate = useNavigate();

  useEffect(() => {
    getGameState(token).then(data => {
      const unguessed = data.facts.filter((f: any) => !f.guessed && f.author !== player.id);
      setFacts(unguessed);
      setCurrent(unguessed[0] || null);
      setPlayers(data.players);
    });
    // scoreboard
    fetch(`/api/game/scoreboard/${token}/`).then(r => r.json()).then(setScores);
  }, [token, player.id]);

  const handleNext = () => {
    const idx = facts.indexOf(current);
    setCurrent(facts[idx + 1] || null);
    setWrongGuesses(0);
    setCorrectGuesser("");
    setResult("");
  };

  const handleResult = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const correctPlayerId = Number(correctGuesser);
      await sendGuessEvent(current.id, correctPlayerId, wrongGuesses);
      setResult("Результат сохранён!");
      setTimeout(handleNext, 1000);
    } catch {
      alert("Ошибка отправки результата");
    }
    setLoading(false);
  };

  if (!current) return (
    <div className="app-container">
      <h2>Раунды завершены!</h2>
      <button onClick={() => navigate("/scoreboard")}>Посмотреть очки</button>
    </div>
  );

  // Сколько осталось вопросов
  const questionsLeft = facts.length;

  // Таблица очков
  const scoreboard = (
    <div style={{ margin: "18px 0" }}>
      <h3>🏆 Таблица очков</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {scores.map((s: any) => (
          <li key={s.id}>
            <b>{players.find((p: any) => p.id === s.player)?.name || s.player}</b>: {s.points}
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

