import React from 'react';
import { AI_LEVELS } from '../types/game';
import { Brain, Settings } from 'lucide-react';

interface AiSettingsProps {
  currentLevel: number;
  onLevelChange: (level: number) => void;
  disabled?: boolean;
}

export const AiSettings: React.FC<AiSettingsProps> = ({
  currentLevel,
  onLevelChange,
  disabled = false,
}) => {
  const currentLevelInfo = AI_LEVELS.find(level => level.value === currentLevel) || AI_LEVELS[4];

  return (
    <div className="game-panel space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
        <Brain className="w-5 h-5" />
        <span>AI Difficulty</span>
      </h3>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{currentLevelInfo.label}</div>
          <div className="text-sm text-gray-400 mt-1">{currentLevelInfo.description}</div>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min={AI_LEVELS[0].value}
            max={AI_LEVELS[AI_LEVELS.length - 1].value}
            step={100}
            value={currentLevel}
            onChange={(e) => onLevelChange(parseInt(e.target.value))}
            disabled={disabled}
            className="skill-slider"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Beginner</span>
            <span>Elite</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {AI_LEVELS.slice(0, 3).map((level) => (
            <button
              key={level.value}
              onClick={() => onLevelChange(level.value)}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                currentLevel === level.value
                  ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                  : disabled
                  ? 'bg-gray-500/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {level.value}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {AI_LEVELS.slice(3, 6).map((level) => (
            <button
              key={level.value}
              onClick={() => onLevelChange(level.value)}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                currentLevel === level.value
                  ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                  : disabled
                  ? 'bg-gray-500/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {level.value}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {AI_LEVELS.slice(6, 9).map((level) => (
            <button
              key={level.value}
              onClick={() => onLevelChange(level.value)}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                currentLevel === level.value
                  ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                  : disabled
                  ? 'bg-gray-500/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {level.value}
            </button>
          ))}
        </div>

        {disabled && (
          <div className="text-center text-sm text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
            Start a new game to change difficulty
          </div>
        )}
      </div>
    </div>
  );
};