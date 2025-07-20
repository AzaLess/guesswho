import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";

export default function CreateGame() {
  const navigate = useNavigate();
  const { toasts, showError, removeToast } = useToast();

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
        showError("Ошибка при создании игры");
      }
    };
    create();
    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>⏳ Создание игры...</h2>
    </div>
  );
}

