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
      
      {/* Примеры для вдохновения */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ 
          color: '#495057', 
          marginBottom: '16px', 
          fontSize: '18px',
          textAlign: 'center'
        }}>
          {t('rules.examples')}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '8px',
          fontSize: '14px',
          color: '#6c757d',
          lineHeight: '1.4'
        }}>
          <div>{t('rules.example1')}</div>
          <div>{t('rules.example2')}</div>
          <div>{t('rules.example3')}</div>
          <div>{t('rules.example4')}</div>
          <div>{t('rules.example5')}</div>
          <div>{t('rules.example6')}</div>
          <div>{t('rules.example7')}</div>
          <div>{t('rules.example8')}</div>
          <div>{t('rules.example9')}</div>
          <div>{t('rules.example10')}</div>
        </div>
        <p style={{ 
          marginTop: '16px', 
          fontSize: '13px', 
          color: '#868e96', 
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {t('facts.inspiration')}
        </p>
      </div>
    </div>
  );
}
