import React from 'react';
import { kickPlayer } from '../api';

interface PlayerKickButtonProps {
  player: {
    id: number;
    name: string;
    emoji: string;
    is_host: boolean;
  };
  currentPlayer: {
    id: number;
    is_host: boolean;
  };
  token: string;
  onKick?: (playerId: number) => void;
  showSuccess?: (message: string) => void;
  showError?: (message: string) => void;
  compact?: boolean;
}

export default function PlayerKickButton({ 
  player, 
  currentPlayer, 
  token, 
  onKick,
  showSuccess,
  showError,
  compact = false
}: PlayerKickButtonProps) {
  // Only show kick button if current player is host and target player is not host
  if (!currentPlayer.is_host || player.is_host) {
    return null;
  }

  const handleKick = async () => {
    if (!confirm(`Are you sure you want to kick ${player.name}? This will remove them and all their unguessed facts from the game.`)) {
      return;
    }

    try {
      await kickPlayer(token, player.id, currentPlayer.id);
      showSuccess?.(`${player.name} has been kicked from the game`);
      onKick?.(player.id);
    } catch (error: any) {
      console.error('Error kicking player:', error);
      showError?.(error.response?.data?.error || 'Failed to kick player');
    }
  };

  return (
    <button
      onClick={handleKick}
      className={compact ? 'kick-btn-compact' : 'kick-btn'}
      title={`Kick ${player.name} from the game`}
      style={{
        background: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: compact ? '4px 6px' : '6px 10px',
        cursor: 'pointer',
        fontSize: compact ? '11px' : '12px',
        marginLeft: '8px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#d32f2f';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f44336';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {compact ? `❌ ${player.name}` : `❌ Kick ${player.name}`}
    </button>
  );
}