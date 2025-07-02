import React from 'react';
import { Crown, Brain } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-white">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Maia Chess
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-gray-300">
              <Brain className="w-5 h-5" />
              <span className="text-sm">Human-like AI Chess Engine</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-white font-medium">Play Against AI</p>
              <p className="text-gray-300 text-sm">Trained on millions of human games</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};