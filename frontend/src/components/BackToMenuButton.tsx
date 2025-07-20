import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface BackToMenuButtonProps {
  style?: React.CSSProperties;
}

export default function BackToMenuButton({ style }: BackToMenuButtonProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBackToMenu = () => {
    // Очищаем все данные игры, но сохраняем язык
    const savedLanguage = localStorage.getItem("language");
    localStorage.clear();
    if (savedLanguage) localStorage.setItem("language", savedLanguage);
    
    navigate('/');
  };

  return (
    <button
      onClick={handleBackToMenu}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '12px',
        zIndex: 1000,
        opacity: 0.8,
        transition: 'opacity 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
      title={t('common.backToMenu')}
    >
      🏠 {t('common.backToMenu')}
    </button>
  );
}
