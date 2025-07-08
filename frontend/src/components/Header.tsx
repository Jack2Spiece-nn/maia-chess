import React from 'react';
import { Crown, Brain, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const { actualTheme } = useTheme();

  return (
    <header className={clsx(
      "backdrop-blur-xl border-b-2 shadow-2xl transition-all duration-500 relative overflow-hidden",
      actualTheme === 'light' ? [
        "bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 border-white/30",
        "text-gray-900"
      ] : [
        "bg-gradient-to-r from-gray-900/95 via-slate-800/95 to-gray-900/95 border-purple-500/30",
        "text-white"
      ]
    )}>
      {/* Animated background gradient */}
      <div className={clsx(
        "absolute inset-0 opacity-30",
        actualTheme === 'light' 
          ? "bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20" 
          : "bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-gradient-shift"></div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 relative z-10">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-3">
              {/* Animated logo container */}
              <div className={clsx(
                "relative p-2 rounded-2xl transition-all duration-300 group cursor-pointer",
                actualTheme === 'light' 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                  : "bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
              )}>
                {/* Glow effect */}
                <div className={clsx(
                  "absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300",
                  actualTheme === 'light' 
                    ? "bg-gradient-to-br from-blue-400 to-purple-500" 
                    : "bg-gradient-to-br from-purple-500 to-indigo-600"
                )}></div>
                
                <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-white relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                
                {/* Sparkle effects */}
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
              </div>

              {/* Enhanced title */}
              <div className="flex flex-col">
                <h1 className={clsx(
                  "text-2xl sm:text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 font-chess",
                  actualTheme === 'light' 
                    ? "from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700" 
                    : "from-purple-400 via-blue-400 to-indigo-400 hover:from-purple-300 hover:via-blue-300 hover:to-indigo-300"
                )}>
                  Maia Chess
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  <Zap className={clsx(
                    "w-3 h-3 sm:w-4 sm:h-4",
                    actualTheme === 'light' ? "text-yellow-500" : "text-yellow-400"
                  )} />
                  <span className={clsx(
                    "text-xs sm:text-sm font-semibold tracking-wide",
                    actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
                  )}>
                    AI-POWERED
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced subtitle for larger screens */}
            <div className="hidden lg:flex items-center space-x-3 ml-6">
              <div className={clsx(
                "p-2 rounded-xl",
                actualTheme === 'light' 
                  ? "bg-gradient-to-br from-green-400 to-emerald-500" 
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              )}>
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={clsx(
                  "font-bold text-lg",
                  actualTheme === 'light' ? "text-gray-800" : "text-white"
                )}>
                  Human-like Intelligence
                </span>
                <span className={clsx(
                  "text-sm",
                  actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
                )}>
                  Trained on millions of human games
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Stats display for medium+ screens */}
            <div className="hidden md:flex flex-col items-end space-y-1">
              <div className="flex items-center space-x-2">
                <div className={clsx(
                  "px-3 py-1 rounded-full text-xs font-bold border-2",
                  actualTheme === 'light' 
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200" 
                    : "bg-gradient-to-r from-emerald-900/50 to-green-900/50 text-emerald-300 border-emerald-600/50"
                )}>
                  ★ PREMIUM AI
                </div>
              </div>
              <p className={clsx(
                "text-sm font-semibold",
                actualTheme === 'light' ? "text-gray-700" : "text-gray-200"
              )}>
                Play Against Neural Networks
              </p>
              <p className={clsx(
                "text-xs",
                actualTheme === 'light' ? "text-gray-500" : "text-gray-400"
              )}>
                ELO Range: 1100-1900
              </p>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Enhanced Profile Avatar */}
            <div className="relative group">
              <div className={clsx(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-6 cursor-pointer relative overflow-hidden",
                actualTheme === 'light' 
                  ? "bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600" 
                  : "bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800"
              )}>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                
                {/* Glow ring */}
                <div className={clsx(
                  "absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300",
                  actualTheme === 'light' 
                    ? "bg-gradient-to-br from-blue-400 to-purple-500" 
                    : "bg-gradient-to-br from-purple-500 to-indigo-600"
                )}></div>
              </div>

              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Mobile subtitle */}
        <div className="mt-3 lg:hidden">
          <div className="flex items-center justify-center space-x-2">
            <Brain className={clsx(
              "w-4 h-4",
              actualTheme === 'light' ? "text-blue-500" : "text-purple-400"
            )} />
            <span className={clsx(
              "text-sm font-semibold",
              actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
            )}>
              Human-like AI Chess Engine
            </span>
            <div className={clsx(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              actualTheme === 'light' 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-emerald-900/50 text-emerald-300"
            )}>
              LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className={clsx(
        "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r",
        actualTheme === 'light' 
          ? "from-blue-400 via-purple-500 to-pink-400" 
          : "from-purple-500 via-blue-500 to-indigo-500"
      )}>
        <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient-shift"></div>
      </div>
    </header>
  );
};