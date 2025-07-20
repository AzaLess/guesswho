import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import BackToMenuButton from "../components/BackToMenuButton";

export default function Rules() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // DEBUG: Проверяем, что возвращает функция перевода
  console.log('Rules DEBUG:', {
    'rules.examples': t('rules.examples'),
    'rules.example1': t('rules.example1'),
    'rules.example2': t('rules.example2')
  });

  return (
    <div className="app-container">
      <BackToMenuButton />
      <h2>{t('rules.title')}</h2>
      
      <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
        <h3>{t('rules.goal')}</h3>
        <p>{t('rules.goalText')}</p>
        
        <h3>{t('rules.participants')}</h3>
        <ul>
          <li><strong>{t('rules.host')}</strong></li>
          <li><strong>{t('rules.players')}</strong></li>
        </ul>
        
        <h3>{t('rules.gameplay')}</h3>
        <ol>
          <li>{t('rules.step1')}</li>
          <li>{t('rules.step2')}</li>
          <li>{t('rules.step3')}</li>
          <li>{t('rules.step4')}</li>
        </ol>
        
        <h3>{t('rules.scoring')}</h3>
        <ul>
          <li>{t('rules.correct')}</li>
          <li>{t('rules.author')}</li>
        </ul>
        
        <h3>{t('rules.examples')}</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px', 
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '16px',
            color: '#000000',
            fontWeight: '600',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            <li>{t('rules.example1')}</li>
            <li>{t('rules.example2')}</li>
            <li>{t('rules.example3')}</li>
            <li>{t('rules.example4')}</li>
            <li>{t('rules.example5')}</li>
            <li>{t('rules.example6')}</li>
            <li>{t('rules.example7')}</li>
            <li>{t('rules.example8')}</li>
            <li>{t('rules.example9')}</li>
            <li>{t('rules.example10')}</li>
          </ul>
        </div>
        
        <p><strong>{t('rules.winner')}</strong></p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => navigate("/")}
          style={{ 
            background: "#4CAF50", 
            color: "white", 
            border: "none", 
            padding: "12px 24px", 
            borderRadius: "8px", 
            cursor: "pointer", 
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          {t('rules.backToMenu')}
        </button>
      </div>
    </div>
  );
}
