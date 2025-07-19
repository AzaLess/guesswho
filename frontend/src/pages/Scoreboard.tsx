import { useEffect, useState } from "react";
import { getScoreboard } from "../api";
import { useNavigate } from "react-router-dom";

export default function Scoreboard() {
  const token = localStorage.getItem("token") || "";
  const [scores, setScores] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getScoreboard(token).then(setScores);
  }, [token]);

  return (
    <div className="app-container">
      <h2>🏆 Таблица очков</h2>
      <ul>
        {scores.map((s, i) => (
          <li key={s.id || i}>
            🧑 <b>{s.player}</b>: ⭐ {s.points}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/end")}>🏁 Завершить игру</button>
    </div>
  );
}
