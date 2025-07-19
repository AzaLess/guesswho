import { useEffect, useState } from "react";
import { getScoreboard, endGame, getStats } from "../api";

export default function EndScreen() {
  const token = localStorage.getItem("token") || "";
  const [scores, setScores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getScoreboard(token).then(setScores);
    getStats(token).then(setStats);
    endGame(token);
  }, [token]);

  return (
    <div className="app-container">
      <h2>🎉 Игра завершена! 🎉</h2>
      <ol>
        {scores.map((s, i) => (
          <li key={s.id || i}>
            {s.player_emoji || "🏅"} <b>{s.player_name}</b>: {s.points} очков
          </li>
        ))}
      </ol>
      <div className="center" style={{ marginTop: 24 }}>
        🥳 Спасибо за игру! 🥳
      </div>
      {stats && (
        <div className="stats-block" style={{ marginTop: 32, background: '#f6f6fa', borderRadius: 12, padding: 16, color: '#222' }}>
          <h3 style={{ color: '#43b324', marginBottom: 16 }}>🏆 Мини-статистика</h3>
          {(!stats.best_guesser && !stats.hardest_fact_text && !stats.most_wrong) ? (
            <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
              Статистика появится после первых раундов
            </div>
          ) : (
            <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
              <li>🔍 <b>Лучший детектив:</b> {stats.best_guesser || '—'}</li>
              <li>🧩 <b>Самый сложный факт:</b> {stats.hardest_fact_text ? `"${stats.hardest_fact_text}" (автор: ${stats.hardest_fact_author})` : '—'}</li>
              <li>🤔 <b>Чаще всех ошибался:</b> {stats.most_wrong || '—'}</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
