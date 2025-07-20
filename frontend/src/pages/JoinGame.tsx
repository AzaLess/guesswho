import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { joinGame } from "../api";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../contexts/LanguageContext";

export default function JoinGame() {
  console.log('DEBUG: JoinGame component loaded with latest changes!');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [token, setToken] = useState(location.state?.token || "");
  const [name, setName] = useState(location.state?.name || "");
  const [loading, setLoading] = useState(false);
  const { toasts, showError, removeToast } = useToast();

  // Очищаем localStorage при загрузке компонента (как в Welcome)
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    localStorage.clear();
    if (savedLanguage) localStorage.setItem("language", savedLanguage);
  }, []);

  const handleJoin = async () => {
    if (!token || !name) return showError(t('welcome.enterNameAndCode'));
    console.log('DEBUG: Starting join process', { token, name });
    setLoading(true);
    try {
      // Нормализуем токен к нижнему регистру
      const normalizedToken = token.toLowerCase().trim();
      console.log('DEBUG: Normalized token:', normalizedToken);
      
      console.log('DEBUG: Calling joinGame API...');
      const player = await joinGame(normalizedToken, name, !!location.state?.isHost);
      console.log('DEBUG: joinGame success, player:', player);
      
      localStorage.setItem("player", JSON.stringify(player));
      localStorage.setItem("token", normalizedToken);
      console.log('DEBUG: Saved to localStorage, navigating to /facts');
      
      navigate("/facts");
      console.log('DEBUG: Navigation called');
    } catch (error) {
      console.error('DEBUG: joinGame failed:', error);
      showError(t('welcome.joinError'));
    }
    setLoading(false);
    console.log('DEBUG: Join process completed');
  };

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2>{t('welcome.join')}</h2>
      <label>{t('welcome.gameCode')}</label>
      <input 
        type="text"
        value={token} 
        onChange={e => setToken(e.target.value.toLowerCase().trim())} 
        placeholder={t('welcome.tokenPlaceholder')}
        style={{ textTransform: 'lowercase' }}
      />
      <label>{t('welcome.playerName')}</label>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('DEBUG: Button clicked! Event:', e);
          console.log('DEBUG: Current state - token:', token, 'name:', name, 'loading:', loading);
          alert('Button clicked! Check console!');
          handleJoin();
        }} 
        disabled={loading}
        style={{backgroundColor: 'red', color: 'white'}}
      >
        {loading ? t('welcome.next') : t('welcome.joinGame')}
      </button>
    </div>
  );
}
