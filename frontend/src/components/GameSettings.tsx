import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Volume2, VolumeX, Eye, Smartphone, Monitor } from 'lucide-react';

interface GameSettingsProps {
  theme: 'classic' | 'modern' | 'neon' | 'wood';
  onThemeChange: (theme: 'classic' | 'modern' | 'neon' | 'wood') => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
  showCoordinates: boolean;
  onCoordinatesToggle: () => void;
  showPossibleMoves: boolean;
  onPossibleMovesToggle: () => void;
  autoRotateBoard: boolean;
  onAutoRotateToggle: () => void;
}

const themes = [
  { id: 'classic', name: 'Classic', colors: ['#f0d9b5', '#b58863'], description: 'Traditional chess board' },
  { id: 'modern', name: 'Modern', colors: ['#edf2f7', '#4a5568'], description: 'Clean and minimal' },
  { id: 'neon', name: 'Neon', colors: ['#1a202c', '#2d3748'], description: 'Dark with neon accents' },
  { id: 'wood', name: 'Wood', colors: ['#deb887', '#8b4513'], description: 'Natural wood texture' }
] as const;

export const GameSettings: React.FC<GameSettingsProps> = ({
  theme,
  onThemeChange,
  isSoundEnabled,
  onSoundToggle,
  showCoordinates,
  onCoordinatesToggle,
  showPossibleMoves,
  onPossibleMovesToggle,
  autoRotateBoard,
  onAutoRotateToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target sound-button focus-ring"
        aria-label="Game Settings"
      >
        <Settings className="w-5 h-5 text-white" />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                absolute right-0 top-12 z-50 w-80 max-w-[90vw] 
                md:w-96 game-panel
                md:relative md:top-0 md:w-full
              `}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Game Settings
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-1 hover:bg-white/10 rounded"
                  >
                    ✕
                  </button>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/90">
                    <Palette className="w-4 h-4" />
                    <span className="font-medium">Board Theme</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((themeOption) => (
                      <motion.button
                        key={themeOption.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onThemeChange(themeOption.id)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 focus-ring
                          ${theme === themeOption.id 
                            ? 'border-blue-400 bg-blue-500/20' 
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-1">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: themeOption.colors[0] }}
                            />
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: themeOption.colors[1] }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {themeOption.name}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 text-left">
                          {themeOption.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sound Settings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/90">
                    {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="font-medium">Sound Effects</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSoundToggle}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all duration-200 focus-ring
                      ${isSoundEnabled 
                        ? 'border-green-400 bg-green-500/20' 
                        : 'border-red-400 bg-red-500/20'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {isSoundEnabled ? 'Sound On' : 'Sound Off'}
                      </span>
                      <div className={`
                        w-12 h-6 rounded-full relative transition-all duration-200
                        ${isSoundEnabled ? 'bg-green-500' : 'bg-gray-500'}
                      `}>
                        <div className={`
                          absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200
                          ${isSoundEnabled ? 'left-6' : 'left-0.5'}
                        `} />
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Display Settings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/90">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Display Options</span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Show Coordinates */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={onCoordinatesToggle}
                      className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 transition-all duration-200 focus-ring"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Show Coordinates</span>
                        <div className={`
                          w-10 h-5 rounded-full relative transition-all duration-200
                          ${showCoordinates ? 'bg-blue-500' : 'bg-gray-500'}
                        `}>
                          <div className={`
                            absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200
                            ${showCoordinates ? 'left-5' : 'left-0.5'}
                          `} />
                        </div>
                      </div>
                    </motion.button>

                    {/* Show Possible Moves */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={onPossibleMovesToggle}
                      className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 transition-all duration-200 focus-ring"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Show Possible Moves</span>
                        <div className={`
                          w-10 h-5 rounded-full relative transition-all duration-200
                          ${showPossibleMoves ? 'bg-blue-500' : 'bg-gray-500'}
                        `}>
                          <div className={`
                            absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200
                            ${showPossibleMoves ? 'left-5' : 'left-0.5'}
                          `} />
                        </div>
                      </div>
                    </motion.button>

                    {/* Auto Rotate Board */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={onAutoRotateToggle}
                      className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 transition-all duration-200 focus-ring"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Auto Rotate Board</span>
                        <div className={`
                          w-10 h-5 rounded-full relative transition-all duration-200
                          ${autoRotateBoard ? 'bg-blue-500' : 'bg-gray-500'}
                        `}>
                          <div className={`
                            absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200
                            ${autoRotateBoard ? 'left-5' : 'left-0.5'}
                          `} />
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Device Optimization Info */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <Smartphone className="w-3 h-3 md:hidden" />
                    <Monitor className="w-3 h-3 hidden md:block" />
                    <span>Optimized for {window.innerWidth < 768 ? 'mobile' : 'desktop'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};