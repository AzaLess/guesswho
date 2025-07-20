import { useEffect, useState } from "react";
import { getGameState, sendGuessEvent, submitFact } from "../api";
import { useNavigate } from "react-router-dom";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";

export default function GameRound() {
  const token = localStorage.getItem("token") || "";
  const player = JSON.parse(localStorage.getItem("player") || "{}");
  const [facts, setFacts] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState("");
  const [correctGuesser, setCorrectGuesser] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAddFact, setShowAddFact] = useState(false);
  const [newFact, setNewFact] = useState("");
  const [addingFact, setAddingFact] = useState(false);
  const [showNewFactCount, setShowNewFactCount] = useState(false);
  const [previousFactsCount, setPreviousFactsCount] = useState(0);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    let prevFactTimestamp: string | null = null;
    const loadGameData = async () => {
      try {
        console.log("GameRound: Loading game state for player:", player);
        const data = await getGameState(token);
        console.log("GameRound: Game state received:", data);
        const unguessed = data.facts.filter((f: any) => !f.guessed);
        console.log("GameRound: All facts:", data.facts);
        console.log("GameRound: Unguessed facts:", unguessed);
        
        // Если игра завершена — сразу переходим на финальный экран
        if (data.ended) {
          navigate("/end");
          return;
        }
        
        // Синхронизируем анимацию +1 по серверному timestamp
        const factTimestamp = data.last_fact_added;
        if (factTimestamp && factTimestamp !== prevFactTimestamp) {
          setShowNewFactCount(true);
          setTimeout(() => setShowNewFactCount(false), 3000);
          prevFactTimestamp = factTimestamp;
        }
        
        // Обновляем localStorage
        localStorage.setItem('lastFactCount', unguessed.length.toString());
        setPreviousFactsCount(unguessed.length);
        
        setFacts(unguessed);
        // НЕ меняем current факт при polling - только если он не установлен
        if (!current && unguessed.length > 0) {
          console.log("GameRound: Устанавливаем первый факт, так как current пустой");
          setCurrent(unguessed[0]);
        }
        setPlayers(data.players);
        
        // Обновляем таблицу очков
        const scoresData = await fetch(`/api/game/scoreboard/${token}/`).then(r => r.json());
        setScores(scoresData);
        
        // Отмечаем, что данные загружены
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading game data:", error);
        showError("Ошибка загрузки игровых данных");
        setDataLoaded(true); // Даже при ошибке отмечаем как загруженное
      }
    };

    // Загружаем данные сразу
    loadGameData();
    
    // Добавляем polling для всех игроков (и ведущего, и участников)
    // чтобы все видели обновления в реальном времени
    const interval = setInterval(loadGameData, 3000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, player.id, player.is_host]);

  const handleNext = async () => {
    // Сбрасываем состояние для следующего вопроса
    setWrongGuesses("");
    setCorrectGuesser("");
    setResult("");
    
    // Обновляем данные игры для получения актуального списка неотвеченных фактов
    try {
      const data = await getGameState(token);
      const unguessed = data.facts.filter((f: any) => !f.guessed);
      setFacts(unguessed);
      
      // Выбираем случайный факт из неотвеченных
      if (unguessed.length > 0) {
        const randomIndex = Math.floor(Math.random() * unguessed.length);
        setCurrent(unguessed[randomIndex]);
      } else {
        setCurrent(null);
      }
    } catch (error) {
      console.error("Error updating game data:", error);
      // Если ошибка, пытаемся выбрать следующий из текущего списка
      const idx = facts.indexOf(current);
      setCurrent(facts[idx + 1] || null);
    }
  };

  const handleAddFact = async () => {
    if (!newFact.trim()) return showError("Введите факт!");
    setAddingFact(true);
    try {
      await submitFact(player.id, newFact);
      setNewFact("");
      setShowAddFact(false);
      // Обновляем данные игры для всех
      const data = await getGameState(token);
      const unguessed = data.facts.filter((f: any) => !f.guessed);
      setFacts(unguessed);
      // НЕ меняем текущий факт при добавлении нового
      showSuccess("Факт добавлен! У всех обновится количество вопросов.");
      // Показываем анимацию увеличения счетчика
      setShowNewFactCount(true);
      setTimeout(() => setShowNewFactCount(false), 3000);
      // Сохраняем timestamp добавления факта для синхронизации
      localStorage.setItem('newFactTimestamp', Date.now().toString());
    } catch {
      showError("Ошибка при добавлении факта");
    }
    setAddingFact(false);
  };

  const handleResult = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const correctPlayerId = Number(correctGuesser);
      await sendGuessEvent(current.id, correctPlayerId, Number(wrongGuesses) || 0);
      // Обновляем таблицу очков после сохранения результата
      const updatedScores = await fetch(`/api/game/scoreboard/${token}/`).then(r => r.json());
      setScores(updatedScores);
      setResult("Результат сохранён!");
      setTimeout(handleNext, 1000);
    } catch {
      showError("Ошибка отправки результата");
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
      <input type="text" value={wrongGuesses} onChange={e => setWrongGuesses(e.target.value)} />
      <button onClick={handleResult} disabled={loading || !correctGuesser}>
        {loading ? "💾 Сохраняю..." : "✅ Сохранить результат"}
      </button>
      {result && <div className="center">🎉 {result}</div>}
    </>
  ) : null;

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>Угадай, кто написал:</h2>
      <div style={{ margin: "20px 0", fontSize: "1.2em", color: "#7ed957" }}>
        "{current.text}"
      </div>
      <div style={{ marginBottom: 10 }}>
        📝 Осталось вопросов: 
        <b style={{ 
          color: showNewFactCount ? '#4CAF50' : 'inherit',
          transition: 'color 0.3s ease'
        }}>
          {questionsLeft}{showNewFactCount ? ' (+1)' : ''}
        </b>
      </div>
      
      {/* Кнопка добавления факта для всех игроков */}
      <div style={{ margin: "15px 0", padding: "10px", border: "1px dashed #ccc", borderRadius: "8px" }}>
        {!showAddFact ? (
          <button 
            onClick={() => setShowAddFact(true)}
            style={{ background: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
          >
            ➕ Добавить факт о себе
          </button>
        ) : (
          <div>
            <h4>➕ Добавить новый факт о себе:</h4>
            <input 
              type="text" 
              value={newFact} 
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Введите интересный факт о себе..."
              style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <div>
              <button 
                onClick={handleAddFact} 
                disabled={addingFact || !newFact.trim()}
                style={{ background: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}
              >
                {addingFact ? "💾 Добавляю..." : "✅ Добавить"}
              </button>
              <button 
                onClick={() => { setShowAddFact(false); setNewFact(""); }}
                style={{ background: "#f44336", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
              >
                ❌ Отмена
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isHost ? guesserSelect : <div style={{ margin: "10px 0" }}>Ожидаем решения ведущего...</div>}
      {scoreboard}
    </div>
  );
}
