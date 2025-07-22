import { useState, useEffect } from 'react';
import { SoundManager } from '../utils/sounds';
import { useLanguage } from '../contexts/LanguageContext';

export default function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isEnabled());
  const { t } = useLanguage();

  useEffect(() => {
    setSoundEnabled(SoundManager.isEnabled());
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundManager.setEnabled(newState);
    
    // Воспроизводим тестовый звук при включении
    if (newState) {
      SoundManager.playNotification();
    }
  };

  return (
    <button
      onClick={toggleSound}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: soundEnabled ? '#4CAF50' : '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
      title={soundEnabled ? t('common.soundOn') : t('common.soundOff')}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
}
