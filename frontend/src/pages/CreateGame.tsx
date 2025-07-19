import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api";

export default function CreateGame() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const create = async () => {
      try {
        const name = localStorage.getItem("name") || "Ведущий";
        const game = await createGame(name);
        if (isMounted) {
          // Сохраняем токен игры
          localStorage.setItem("token", game.token);
          // Получаем данные ведущего через getGameState
          const state = await fetch(`/api/game/state/${game.token}/`).then(r => r.json());
          const hostPlayer = state.players.find((p: any) => p.is_host);
          if (hostPlayer) {
            localStorage.setItem("player", JSON.stringify(hostPlayer));
          }
          navigate("/facts", { state: { token: game.token, isHost: true } });
        }
      } catch {
        alert("Ошибка при создании игры");
      }
    };
    create();
    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <div className="app-container">
      <h2>⏳ Создание игры...</h2>
    </div>
  );
}

