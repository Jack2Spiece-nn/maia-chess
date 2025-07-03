import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { clsx } from 'clsx';
import { AI_LEVELS, NODES_OPTIONS, type AiLevel, type NodesOption } from '../types/game';

interface AiSettingsProps {
  currentLevel: AiLevel;
  currentNodes: NodesOption;
  onLevelChange: (level: AiLevel) => void;
  onNodesChange: (nodes: NodesOption) => void;
  disabled?: boolean;
}

// Helper functions for legacy compatibility
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

// Helper function to get rating from level
export const getRatingFromLevel = (level: number): number => {
  const aiLevel = aiLevels.find(ai => ai.level === level);
  return aiLevel ? aiLevel.rating : 1500; // Default to 1500
};

// Helper function to get level from rating  
export const getLevelFromRating = (rating: number): number => {
  const aiLevel = aiLevels.find(ai => ai.rating === rating);
  return aiLevel ? aiLevel.level : 5; // Default to level 5 (1500)
};

export const AiSettings: React.FC<AiSettingsProps> = ({
  currentLevel,
  currentNodes,
  onLevelChange,
  onNodesChange,
  disabled = false,
}) => {
  const { isMobile } = useDeviceType();

  return (
    <div className={clsx(
      "game-panel space-y-4",
      isMobile && "game-panel-mobile"
    )}>
      <h3 className={clsx(
        "font-semibold text-white flex items-center space-x-2",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Brain className={clsx("w-5 h-5 text-purple-400", isMobile && "w-4 h-4")} />
        <span>AI Settings</span>
      </h3>

      <div className="space-y-6">
        {/* AI Level Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">AI Level</h4>
          </div>
          
          <div className="space-y-2">
            <select
              value={currentLevel}
              onChange={(e) => onLevelChange(Number(e.target.value) as AiLevel)}
              disabled={disabled}
              className={clsx(
                "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMobile ? "text-base" : "text-sm"
              )}
            >
              {AI_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            
            <p className="text-xs text-slate-400">
              {AI_LEVELS.find(level => level.value === currentLevel)?.description}
            </p>
          </div>
        </div>

        {/* Nodes Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-white">Search Depth</h4>
          </div>
          
          <div className="space-y-2">
            <select
              value={currentNodes}
              onChange={(e) => onNodesChange(Number(e.target.value) as NodesOption)}
              className={clsx(
                "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white",
                "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
                isMobile ? "text-base" : "text-sm"
              )}
            >
              {NODES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <p className="text-xs text-slate-400">
              {NODES_OPTIONS.find(option => option.value === currentNodes)?.description}
            </p>
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-300">
                <strong>Note:</strong> Higher node counts make Maia stronger but slower. 
                Start with 1 node (original behavior) and increase if you want stronger play.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Note */}
        {disabled && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-300">
              AI level can only be changed between games. Node count can be adjusted anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};