import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";


export default function Welcome() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const { toasts, showError, removeToast } = useToast();

  const handleStart = () => {
    if (role === "host") {
      if (!name.trim()) return showError("Введите имя!");
      // Очищаем все данные предыдущей игры
      localStorage.clear();
      localStorage.setItem("role", "host");
      localStorage.setItem("name", name);
      navigate("/create");
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !token.trim()) return showError("Введите имя и код комнаты!");
    // Очищаем все данные предыдущей игры
    localStorage.clear();
    localStorage.setItem("role", "player");
    localStorage.setItem("name", name);
    localStorage.setItem("token", token);
    try {
      const res = await fetch("/api/game/join/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, is_host: false })
      });
      if (!res.ok) throw new Error();
      const player = await res.json();
      localStorage.setItem("player", JSON.stringify(player));
      window.location.href = "/facts";
    } catch {
      showError("Ошибка входа. Проверьте код и попробуйте снова.");
    }
  };


  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h1>🤔 Угадай кто? 🎉</h1>
      {!role && (
        <div className="role-select">
          <button onClick={() => setRole("host")}>👑 Я ведущий</button>
          <button onClick={() => setRole("player")}>🙋 Я участник</button>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => navigate("/rules")}
              style={{ 
                background: "#2196F3", 
                color: "white", 
                border: "none", 
                padding: "10px 20px", 
                borderRadius: "6px", 
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              📋 Правила
            </button>
          </div>
        </div>
      )}
      {role === "player" && (
        <div className="player-form">
          <label>Ваше имя:</label>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={16} />
          <label>Код комнаты:</label>
          <input value={token} onChange={e => setToken(e.target.value)} maxLength={16} />
          <button className="primary" onClick={handleJoin}>🚀 Войти</button>
          <button className="secondary" onClick={() => setRole(null)}>← Назад</button>
        </div>
      )}
      {role === "host" && (
        <div className="host-form">
          <label>Ваше имя (ведущий):</label>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={16} />
          <button className="primary" onClick={handleStart}>Далее</button>
          <button className="secondary" onClick={() => setRole(null)}>← Назад</button>
        </div>
      )}
    </div>
  );
}
