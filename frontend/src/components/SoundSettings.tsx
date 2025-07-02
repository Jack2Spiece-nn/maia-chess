import React from 'react';
import { useChessSound } from '../hooks/useSound';

export const SoundSettings: React.FC = () => {
  const { volume, enabled, setVolume, toggleEnabled } = useChessSound();

  return (
    <div className="game-panel space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
        <span>🔊</span>
        <span>Sound Settings</span>
      </h3>

      <div className="space-y-4">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sound Effects</span>
          <button
            onClick={toggleEnabled}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Volume</span>
            <div className="flex items-center space-x-2">
              <span>{enabled ? '🔊' : '🔇'}</span>
              <span className="text-xs text-gray-500 w-8 text-center">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={!enabled}
            className={`
              skill-slider
              ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        </div>

        {/* Sound Preview */}
        <div className="text-xs text-gray-500">
          <p>Sound effects include move confirmations, captures, check alerts, and game notifications.</p>
        </div>
      </div>
    </div>
  );
};