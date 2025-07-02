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
  { level: 1, rating: 1100, description: "Beginner", color: "text-green-500" },
  { level: 2, rating: 1200, description: "Novice", color: "text-green-500" },
  { level: 3, rating: 1300, description: "Casual", color: "text-blue-500" },
  { level: 4, rating: 1400, description: "Amateur", color: "text-blue-500" },
  { level: 5, rating: 1500, description: "Club Player", color: "text-yellow-500" },
  { level: 6, rating: 1600, description: "Advanced", color: "text-yellow-500" },
  { level: 7, rating: 1700, description: "Expert", color: "text-orange-500" },
  { level: 8, rating: 1800, description: "Master", color: "text-red-500" },
  { level: 9, rating: 1900, description: "Grandmaster", color: "text-purple-500" },
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
        "font-semibold text-gray-800 flex items-center space-x-2",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Brain className={clsx("w-5 h-5 text-purple-600", isMobile && "w-4 h-4")} />
        <span>AI Opponent</span>
        {!disabled && (
          <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
        )}
      </h3>

      <div className="space-y-4">
        {/* Current AI Info */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Maia Level {currentLevel}</span>
            </div>
            <span className={clsx("text-sm font-bold", currentAi.color)}>
              {currentAi.description}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-600">Target Rating</div>
              <div className="text-gray-800 font-bold text-lg">{currentAi.rating}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Playing Style</div>
              <div className="text-gray-800 font-semibold">Human-like</div>
            </div>
          </div>
        </div>

        {/* Level Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <div className="flex items-center space-x-1">
              <Info className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
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
            <div className="flex justify-between mt-3 px-1">
              {aiLevels.map((ai) => (
                <div
                  key={ai.level}
                  className={clsx(
                    "text-xs text-center transition-all duration-200",
                    ai.level === currentLevel 
                      ? `${ai.color} font-bold transform scale-125` 
                      : "text-gray-400"
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
            <div className="text-xs text-gray-600 text-center font-medium">Quick Select</div>
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
                    "py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 touch-feedback shadow-sm",
                    level === currentLevel
                      ? "ai-level-button active"
                      : "ai-level-button",
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
        <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
          <div className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">Maia</strong> is trained on millions of human games 
            to play like a {currentAi.description.toLowerCase()} player would. Unlike traditional 
            engines, Maia makes <em className="text-blue-600 font-medium">human-like mistakes</em> and 
            follows recognizable patterns.
          </div>
        </div>

        {/* Performance Indicator */}
        {!disabled && (
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    i < currentLevel / 3 ? "bg-purple-500" : "bg-gray-300"
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