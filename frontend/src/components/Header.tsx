import React from 'react';
import { Crown, Brain } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const { actualTheme } = useTheme();

  return (
    <header className={clsx(
      "backdrop-blur-md border-b shadow-sm transition-all duration-300",
      actualTheme === 'light' ? [
        "bg-white/95 border-primary-200",
        "text-gray-900"
      ] : [
        "bg-white/95 border-purple-100",
        "text-gray-900"
      ]
    )}>
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <div className={clsx(
                "p-1 rounded-lg transition-all duration-200",
                actualTheme === 'light' ? "bg-primary-50" : "bg-purple-50"
              )}>
                <Crown className={clsx(
                  "w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-200",
                  actualTheme === 'light' ? "text-primary-600" : "text-purple-600"
                )} />
              </div>
              <h1 className={clsx(
                "text-xl sm:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-200",
                actualTheme === 'light' 
                  ? "from-primary-600 to-secondary-600" 
                  : "from-purple-600 to-indigo-600"
              )}>
                Maia Chess
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              <Brain className={clsx(
                "w-5 h-5 transition-colors duration-200",
                actualTheme === 'light' ? "text-primary-500" : "text-purple-500"
              )} />
              <span className="text-sm">Human-like AI Chess Engine</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-gray-800 font-semibold text-sm">Play Against AI</p>
              <p className="text-gray-600 text-xs">Trained on millions of human games</p>
            </div>
            
            <ThemeToggle />
            
            <div className={clsx(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
              actualTheme === 'light' 
                ? "bg-gradient-to-r from-primary-600 to-secondary-600" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600"
            )}>
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};