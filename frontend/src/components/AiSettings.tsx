import React from 'react';
import { Brain, Zap, Target, Info } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { clsx } from 'clsx';

interface AiSettingsProps {
  currentLevel: number;
  onLevelChange: (level: number) => void;
  disabled: boolean;
}

const aiLevels = [
  { level: 1, rating: 1100, description: "Beginner", color: "text-green-400" },
  { level: 2, rating: 1200, description: "Novice", color: "text-green-400" },
  { level: 3, rating: 1300, description: "Casual", color: "text-blue-400" },
  { level: 4, rating: 1400, description: "Amateur", color: "text-blue-400" },
  { level: 5, rating: 1500, description: "Club Player", color: "text-yellow-400" },
  { level: 6, rating: 1600, description: "Advanced", color: "text-yellow-400" },
  { level: 7, rating: 1700, description: "Expert", color: "text-orange-400" },
  { level: 8, rating: 1800, description: "Master", color: "text-red-400" },
  { level: 9, rating: 1900, description: "Grandmaster", color: "text-purple-400" },
];

export const AiSettings: React.FC<AiSettingsProps> = ({
  currentLevel,
  onLevelChange,
  disabled,
}) => {
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();

  const currentAi = aiLevels.find(ai => ai.level === currentLevel) || aiLevels[4];

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(event.target.value);
    onLevelChange(newLevel);
    playSound('buttonClick');
  };

  return (
    <div className={clsx(
      "game-panel space-y-4",
      isMobile && "game-panel-mobile"
    )}>
      <h3 className={clsx(
        "font-semibold text-white flex items-center space-x-2",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Brain className={clsx("w-5 h-5", isMobile && "w-4 h-4")} />
        <span>AI Opponent</span>
        {!disabled && (
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        )}
      </h3>

      <div className="space-y-4">
        {/* Current AI Info */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Maia Level {currentLevel}</span>
            </div>
            <span className={clsx("text-sm font-bold", currentAi.color)}>
              {currentAi.description}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Target Rating</div>
              <div className="text-white font-semibold text-lg">{currentAi.rating}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Playing Style</div>
              <div className="text-white font-semibold">Human-like</div>
            </div>
          </div>
        </div>

        {/* Level Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Difficulty Level
            </label>
            <div className="flex items-center space-x-1">
              <Info className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {disabled ? 'In Game' : 'Adjustable'}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="9"
              value={currentLevel}
              onChange={handleLevelChange}
              disabled={disabled}
              className={clsx(
                "skill-slider w-full",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
            
            {/* Level Markers */}
            <div className="flex justify-between mt-2 px-1">
              {aiLevels.map((ai) => (
                <div
                  key={ai.level}
                  className={clsx(
                    "text-xs text-center transition-all duration-200",
                    ai.level === currentLevel 
                      ? `${ai.color} font-bold transform scale-110` 
                      : "text-gray-500"
                  )}
                >
                  {ai.level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Level Buttons - Mobile Only */}
        {isMobile && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 text-center">Quick Select</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 1, label: "Easy" },
                { level: 5, label: "Medium" },
                { level: 9, label: "Hard" }
              ].map(({ level, label }) => (
                <button
                  key={level}
                  onClick={() => {
                    onLevelChange(level);
                    playSound('buttonClick');
                  }}
                  disabled={disabled}
                  className={clsx(
                    "py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 touch-feedback",
                    level === currentLevel
                      ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                      : "bg-white/10 text-gray-300 border border-white/20",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Description */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-white">Maia</strong> is trained on millions of human games 
            to play like a {currentAi.description.toLowerCase()} player would. Unlike traditional 
            engines, Maia makes <em className="text-blue-300">human-like mistakes</em> and 
            follows recognizable patterns.
          </div>
        </div>

        {/* Performance Indicator */}
        {!disabled && (
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-1 h-1 rounded-full",
                    i < currentLevel / 3 ? "bg-blue-400" : "bg-gray-600"
                  )}
                />
              ))}
            </div>
            <span>AI Strength</span>
          </div>
        )}
      </div>
    </div>
  );
};