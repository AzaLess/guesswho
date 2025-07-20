import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import BackToMenuButton from '../components/BackToMenuButton';

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  count: number;
}

interface AnalyticsData {
  total_games: number;
  total_players: number;
  avg_players_per_game: number;
  avg_game_duration_minutes: number;
  most_active_day: string;
  games_this_week: number;
  games_this_month: number;
  recent_games: Array<{
    token: string;
    created_at: string;
    started: boolean;
    ended: boolean;
    player_count: number;
    countries: CountryInfo[];
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/game/analytics/');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <BackToMenuButton />
        <h2>{t('analytics.title')}</h2>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <span style={{ fontSize: 32 }}>⏳</span>
          <div style={{ marginTop: 16 }}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-container">
        <BackToMenuButton />
        <h2>{t('analytics.title')}</h2>
        <div style={{ textAlign: 'center', color: '#f44336', marginTop: 40 }}>
          {error || t('analytics.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <BackToMenuButton />
      <h2>{t('analytics.title')}</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#4CAF50', fontWeight: 'bold' }}>
            {data.total_games}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.totalGames')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#2196F3', fontWeight: 'bold' }}>
            {data.total_players}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.totalPlayers')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#FF9800', fontWeight: 'bold' }}>
            {data.avg_players_per_game}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.avgPlayersPerGame')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#9C27B0', fontWeight: 'bold' }}>
            {data.avg_game_duration_minutes.toFixed(1)}m
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.avgGameDuration')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', color: '#607D8B', fontWeight: 'bold' }}>
            {data.most_active_day}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.mostActiveDay')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#4CAF50', fontWeight: 'bold' }}>
            {data.games_this_week}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.gamesThisWeek')}
          </div>
        </div>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#2196F3', fontWeight: 'bold' }}>
            {data.games_this_month}
          </div>
          <div style={{ marginTop: '8px', color: '#666' }}>
            {t('analytics.gamesThisMonth')}
          </div>
        </div>
      </div>

      {data.recent_games.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>📋 Recent Games</h3>
          <div style={{ 
            background: '#f5f5f5', 
            borderRadius: '12px', 
            padding: '20px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {data.recent_games.map((game, index) => (
              <div key={index} style={{ 
                padding: '12px 0',
                borderBottom: index < data.recent_games.length - 1 ? '1px solid #ddd' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{game.token}</strong>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {new Date(game.created_at).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {game.player_count} player{game.player_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {game.started && <span style={{ color: '#4CAF50', fontSize: '14px' }} title="Started">▶️</span>}
                    {game.ended && <span style={{ color: '#f44336', fontSize: '14px' }} title="Ended">🏁</span>}
                  </div>
                </div>
                
                {/* Countries section */}
                {game.countries && game.countries.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px', 
                    marginTop: '8px'
                  }}>
                    {game.countries.map((country, countryIndex) => (
                      <div key={countryIndex} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#e8f5e8',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#2e7d32'
                      }}>
                        <span style={{ fontSize: '14px' }}>{country.flag}</span>
                        <span>{country.code}</span>
                        {country.count > 1 && (
                          <span style={{ 
                            background: '#4CAF50', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: '16px', 
                            height: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {country.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
