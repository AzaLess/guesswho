import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "../api";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";

export default function Welcome() {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState(""); // "host" или "player"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toasts, showError, removeToast } = useToast();

  // Очищаем localStorage при загрузке компонента
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    localStorage.clear();
    if (savedLanguage) localStorage.setItem("language", savedLanguage);
  }, []);

  const handleStart = async () => {
    if (!name) return showError(t('welcome.enterNameAndCode'));
    console.log('DEBUG: Creating game for host:', name);
    setLoading(true);
    
    try {
      const response = await createGame(name);
      console.log('DEBUG: Game created successfully:', response);
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("player", JSON.stringify(response.player));
        localStorage.setItem("role", "host");
        console.log('DEBUG: Navigating to /facts as host');
        navigate("/facts");
      }
    } catch (error) {
      console.error('DEBUG: Failed to create game:', error);
      showError(t('create.error'));
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!token || !name) return showError(t('welcome.enterNameAndCode'));
    console.log('DEBUG: Starting join process', { token, name });
    setLoading(true);
    
    try {
      // Нормализуем токен к нижнему регистру
      const normalizedToken = token.toLowerCase().trim();
      console.log('DEBUG: Normalized token:', normalizedToken);
      
      console.log('DEBUG: Calling joinGame API...');
      const player = await joinGame(normalizedToken, name, false);
      console.log('DEBUG: joinGame success, player:', player);
      
      localStorage.setItem("player", JSON.stringify(player));
      localStorage.setItem("token", normalizedToken);
      localStorage.setItem("role", "player");
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
      <h1>{t('welcome.title')}</h1>
      <LanguageSelector />
      <p>{t('welcome.subtitle')}</p>
      
      {!mode && (
        <div className="role-select">
          <button onClick={() => setMode("host")}>{t('welcome.host')}</button>
          <button onClick={() => setMode("player")}>{t('welcome.join')}</button>
        </div>
      )}
      
      {mode === "host" && (
        <div className="name-input">
          <input
            type="text"
            placeholder={t('welcome.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleStart} disabled={loading}>
            {loading ? t('create.title') : t('welcome.startGame')}
          </button>
          <button onClick={() => setMode("")}>{t('welcome.back')}</button>
        </div>
      )}
      
      {mode === "player" && (
        <div className="name-input">
          <label>{t('welcome.gameCode')}</label>
          <input 
            value={token} 
            onChange={(e) => setToken(e.target.value.toLowerCase().trim())} 
            placeholder={t('welcome.tokenPlaceholder')}
          />
          <label>{t('welcome.playerName')}</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder={t('welcome.namePlaceholder')}
          />
          <button 
            onClick={handleJoin} 
            disabled={loading}
            style={{backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white'}}
          >
            {loading ? t('welcome.next') : t('welcome.joinGame')}
          </button>
          <button onClick={() => setMode("")}>{t('welcome.back')}</button>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/rules')} className="rules-button">
          📋 {t('welcome.rules')}
        </button>
      </div>
      
      {/* Секретная аналитика доступна по ссылке /secret-analytics */}
    </div>
  );
}
