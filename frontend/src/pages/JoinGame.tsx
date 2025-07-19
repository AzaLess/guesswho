import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { joinGame } from "../api";

export default function JoinGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(location.state?.token || "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!token || !name) return alert("Введите код игры и имя!");
    setLoading(true);
    try {
      const player = await joinGame(token, name, !!location.state?.isHost);
      localStorage.setItem("player", JSON.stringify(player));
      localStorage.setItem("token", token);
      navigate("/facts");
    } catch {
      alert("Ошибка входа. Проверьте код и попробуйте снова.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h2>🚪 Вход в игру</h2>
      <label>🔑 Код игры:</label>
      <input value={token} onChange={e => setToken(e.target.value)} />
      <label>🧑 Ваше имя:</label>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleJoin} disabled={loading}>
        {loading ? "⏳ Вход..." : "🚀 Войти"}
      </button>
    </div>
  );
}
