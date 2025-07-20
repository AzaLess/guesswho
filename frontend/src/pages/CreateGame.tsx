import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../contexts/LanguageContext";

export default function CreateGame() {
  const navigate = useNavigate();
  const { toasts, showError, removeToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const create = async () => {
      try {
        const name = localStorage.getItem("name") || "Host";
        const game = await createGame(name);
        if (isMounted) {
          // Сохраняем токен игры и данные игрока
          localStorage.setItem("token", game.token);
          if (game.player) {
            localStorage.setItem("player", JSON.stringify(game.player));
          }
          navigate("/facts", { state: { token: game.token, isHost: true } });
        }
      } catch {
        showError(t('create.error'));
      }
    };
    create();
    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>{t('create.title')}</h2>
    </div>
  );
}

