import React from 'react';
import { ChessGame } from './components/ChessGame';
import { Header } from './components/Header';
import { useDeviceType } from './hooks/useDeviceType';
import { clsx } from 'clsx';

function App() {
  const { isMobile, isTablet, orientation } = useDeviceType();

  return (
    <div className={clsx(
      "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
      "relative overflow-x-hidden",
      isMobile && "min-h-screen supports-[height:100dvh]:min-h-[100dvh]"
    )}>
      {/* Enhanced Background for Mobile */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <Header />
      
      <main className={clsx(
        "relative z-10",
        isMobile 
          ? "px-0 py-2" 
          : "container mx-auto px-4 py-8"
      )}>
        <ChessGame />
      </main>

      {/* Mobile-specific enhancements */}
      {isMobile && (
        <>
          {/* Safe area spacer */}
          <div className="h-safe-bottom" />
          
          {/* Performance indicator */}
          <div className="fixed bottom-2 left-2 z-50 opacity-30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;