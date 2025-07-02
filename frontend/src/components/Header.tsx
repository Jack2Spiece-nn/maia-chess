import React from 'react';
import { Crown, Brain } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Maia Chess
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Human-like AI Chess Engine</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-gray-800 font-semibold text-sm">Play Against AI</p>
              <p className="text-gray-600 text-xs">Trained on millions of human games</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};