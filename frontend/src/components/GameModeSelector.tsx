import React, { useState } from 'react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { clsx } from 'clsx';

interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const gameModes: GameMode[] = [
  {
    id: 'classic',
    name: 'Classic Game',
    description: 'Traditional chess against Maia AI',
    icon: '♔',
    features: ['Human-like AI', 'Adjustable difficulty', 'Full game'],
    difficulty: 'intermediate'
  },
  {
    id: 'tutorial',
    name: 'Tutorial Mode',
    description: 'Learn chess basics with guided gameplay',
    icon: '🎓',
    features: ['Step-by-step guidance', 'Move suggestions', 'Educational tips'],
    difficulty: 'beginner'
  },
  {
    id: 'puzzle',
    name: 'Daily Puzzle',
    description: 'Solve chess puzzles to improve',
    icon: '🧩',
    features: ['Tactical training', 'Progressive difficulty', 'Daily challenges'],
    difficulty: 'intermediate'
  },
  {
    id: 'blitz',
    name: 'Blitz Game',
    description: 'Quick 5-minute games',
    icon: '⚡',
    features: ['Time pressure', 'Fast gameplay', 'Skill building'],
    difficulty: 'advanced'
  },
  {
    id: 'analysis',
    name: 'Game Analysis',
    description: 'Analyze your previous games',
    icon: '📊',
    features: ['Move evaluation', 'Mistake detection', 'Improvement tips'],
    difficulty: 'intermediate'
  },
  {
    id: 'endgame',
    name: 'Endgame Practice',
    description: 'Practice endgame scenarios',
    icon: '🏁',
    features: ['Specific positions', 'Technique training', 'Common patterns'],
    difficulty: 'advanced'
  }
];

interface GameModeSelectorProps {
  onModeSelect: (mode: GameMode) => void;
  currentMode?: string;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onModeSelect,
  currentMode = 'classic'
}) => {
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const handleModeSelect = (mode: GameMode) => {
    onModeSelect(mode);
    playSound('buttonClick');
  };

  const handleCategorySelect = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    playSound('buttonClick');
  };

  const filteredModes = gameModes.filter(mode => 
    selectedCategory === 'all' || mode.difficulty === selectedCategory
  );

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className={clsx(
      "game-panel space-y-6",
      isMobile && "game-panel-mobile"
    )}>
      <div className="text-center space-y-2">
        <h2 className={clsx(
          "font-bold text-white",
          isMobile ? "text-lg" : "text-xl"
        )}>
          Choose Your Game Mode
        </h2>
        <p className="text-gray-400 text-sm">
          Select how you'd like to play with Maia
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { id: 'all', label: 'All Modes' },
          { id: 'beginner', label: 'Beginner' },
          { id: 'intermediate', label: 'Intermediate' },
          { id: 'advanced', label: 'Advanced' }
        ].map(category => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id as any)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 touch-feedback",
              selectedCategory === category.id
                ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Game Mode Grid */}
      <div className={clsx(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
      )}>
        {filteredModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode)}
            className={clsx(
              "text-left p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 touch-feedback",
              currentMode === mode.id
                ? "bg-blue-500/20 border-blue-500/50 shadow-lg"
                : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
            )}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="text-sm font-medium text-white">{mode.name}</div>
                </div>
                {mode.difficulty && (
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full border",
                    getDifficultyColor(mode.difficulty)
                  )}>
                    {mode.difficulty}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <div className="space-y-1">
                {mode.features.slice(0, isMobile ? 2 : 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Status Indicator */}
              {currentMode === mode.id && (
                <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Currently Selected</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="text-center space-y-2">
        <div className="text-xs text-gray-500">More game modes coming soon!</div>
        <div className="flex justify-center space-x-2">
          {['🏆', '🎯', '⏰', '🔀'].map((icon, index) => (
            <span key={index} className="text-gray-600 opacity-50">{icon}</span>
          ))}
        </div>
      </div>
    </div>
  );
};