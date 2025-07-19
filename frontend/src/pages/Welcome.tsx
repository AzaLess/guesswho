import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Welcome() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");

  const handleStart = () => {
    if (role === "host") {
      if (!name.trim()) return alert("Введите имя!");
      localStorage.setItem("role", "host");
      localStorage.setItem("name", name);
      navigate("/create");
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !token.trim()) return alert("Введите имя и код комнаты!");
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
      alert("Ошибка входа. Проверьте код и попробуйте снова.");
    }
  };


  return (
    <div className="app-container">
      <h1>🤔 Угадай кто? 🎉</h1>
      {!role && (
        <div className="role-select">
          <button onClick={() => setRole("host")}>👑 Я ведущий</button>
          <button onClick={() => setRole("player")}>🙋 Я участник</button>
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
