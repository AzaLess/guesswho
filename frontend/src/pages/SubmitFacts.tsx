import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitFact } from "../api";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../contexts/LanguageContext";
import BackToMenuButton from "../components/BackToMenuButton";

export default function SubmitFacts() {
  const getPlayerFromStorage = () => {
    try {
      const playerData = localStorage.getItem("player");
      return playerData ? JSON.parse(playerData) : {};
    } catch (error) {
      console.error('Error parsing player data from localStorage:', error);
      return {};
    }
  };
  const player = getPlayerFromStorage();
  const token = localStorage.getItem("token") || "";
  const [facts, setFacts] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { toasts, showError, removeToast } = useToast();
  const { t } = useLanguage();

  const handleChange = (i: number, value: string) => {
    const arr = [...facts];
    arr[i] = value;
    setFacts(arr);
  };

  const handleSubmit = async () => {
    if (facts.some(f => !f.trim())) return showError(t('facts.error'));
    setLoading(true);
    try {
      for (let fact of facts) {
        await submitFact(player.id, fact);
      }
      setDone(true);
      navigate("/waiting");
    } catch {
      showError(t('facts.submitError'));
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <BackToMenuButton />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {token && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {token.toUpperCase()}
        </div>
      )}
      <h2>{t('facts.title')}</h2>
      {facts.map((fact, i) => (
        <input
          key={i}
          placeholder={`${t('facts.placeholder')} ${i + 1}`}
          value={fact}
          onChange={e => handleChange(i, e.target.value)}
        />
      ))}
      <button onClick={handleSubmit} disabled={loading || done}>
        {loading ? t('facts.sending') : done ? t('facts.done') : t('facts.send')}
      </button>
    </div>
  );
}
