import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Palette, Lock, Crown, Sparkles, Check } from 'lucide-react';
import { useChessBoardTheme } from './ChessBoardThemes';
import { useDeviceType } from '../hooks/useDeviceType';
import { RippleEffect } from './RippleEffect';

interface ThemeSelectorProps {
  onClose?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose }) => {
  const { currentTheme, setTheme, availableThemes, isThemeUnlocked } = useChessBoardTheme();
  const { isMobile } = useDeviceType();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.id);

  const handleThemeSelect = (themeId: string) => {
    if (isThemeUnlocked(themeId)) {
      setSelectedTheme(themeId);
      setTheme(themeId);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }
  };

  return (
    <div className={clsx(
      "glass-morphism-strong rounded-2xl shadow-2xl p-6",
      "border border-white/20 backdrop-blur-xl",
      "animate-fade-in",
      isMobile ? "max-w-sm" : "max-w-md"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Chess Board Themes</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableThemes.map((theme) => {
          const isUnlocked = isThemeUnlocked(theme.id);
          const isSelected = selectedTheme === theme.id;
          const isPremium = theme.isPremium;

          return (
            <RippleEffect
              key={theme.id}
              disabled={!isUnlocked}
              className={clsx(
                "relative p-3 rounded-xl border transition-all duration-300",
                "cursor-pointer hover:scale-105",
                isSelected && "ring-2 ring-purple-400 ring-opacity-50",
                isUnlocked ? [
                  "border-white/20 hover:border-white/40",
                  "bg-gradient-to-br from-white/5 to-white/10"
                ] : [
                  "border-white/10 opacity-50 cursor-not-allowed",
                  "bg-gradient-to-br from-white/2 to-white/5"
                ]
              )}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {/* Theme Preview */}
              <div className="relative mb-3">
                <div className="grid grid-cols-4 gap-0.5 aspect-square rounded-lg overflow-hidden">
                  {Array.from({ length: 16 }, (_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const isLight = (row + col) % 2 === 0;
                    return (
                      <div
                        key={i}
                        className="aspect-square"
                        style={{
                          backgroundColor: isLight ? theme.lightSquare : theme.darkSquare,
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Theme glow effect */}
                {isUnlocked && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-30 animate-pulse"
                    style={{
                      boxShadow: `0 0 20px ${theme.glowColor}`,
                    }}
                  />
                )}
              </div>

              {/* Theme Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={clsx(
                    "text-sm font-medium",
                    isUnlocked ? "text-white" : "text-white/50"
                  )}>
                    {theme.name}
                  </h4>
                  
                  <div className="flex items-center space-x-1">
                    {isPremium && (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    )}
                    {isSelected && (
                      <Check className="w-3 h-3 text-green-400" />
                    )}
                    {!isUnlocked && (
                      <Lock className="w-3 h-3 text-white/50" />
                    )}
                  </div>
                </div>
                
                <p className={clsx(
                  "text-xs",
                  isUnlocked ? "text-white/70" : "text-white/40"
                )}>
                  {theme.description}
                </p>
              </div>

              {/* Premium badge */}
              {isPremium && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">PRO</span>
                  </div>
                </div>
              )}

              {/* Lock overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-6 h-6 text-white/50 mx-auto mb-1" />
                    <p className="text-xs text-white/50">Locked</p>
                  </div>
                </div>
              )}

              {/* Selection glow */}
              {isSelected && isUnlocked && (
                <div className="absolute inset-0 rounded-xl border-2 border-purple-400 animate-pulse" />
              )}
            </RippleEffect>
          );
        })}
      </div>

      {/* Theme unlock info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-medium text-white">Premium Themes</h4>
        </div>
        <p className="text-xs text-white/70">
          Win games or achieve milestones to unlock premium themes. Show off your skills with exclusive board designs!
        </p>
      </div>
    </div>
  );
};

export default ThemeSelector;