import { useLanguage, type Language } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string; emoji: string }[] = [
    { code: 'en', name: 'English', emoji: '🇬🇧' },
    { code: 'uk', name: 'Українська', emoji: '🇺🇦' },
    { code: 'ru', name: 'Русский', emoji: '🌐' }, // Используем глобус вместо флага
    { code: 'de', name: 'Deutsch', emoji: '🇩🇪' },
  ];

  const getLanguageCode = (code: Language): string => {
    switch (code) {
      case 'en': return 'EN';
      case 'uk': return 'UA';
      case 'ru': return 'RU';
      case 'de': return 'DE';
      default: return 'EN';
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      margin: '16px 0',
      padding: '8px',
    }}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          style={{
            background: language === lang.code ? '#4CAF50' : 'transparent',
            border: language === lang.code ? '2px solid #4CAF50' : '2px solid #666',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: language === lang.code ? 'bold' : 'normal',
            color: language === lang.code ? 'white' : '#aaa',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
          title={lang.name}
        >
          <span style={{ fontSize: '16px' }}>{lang.emoji}</span>
          <span style={{ fontSize: '12px' }}>{getLanguageCode(lang.code)}</span>
        </button>
      ))}
    </div>
  );
}
