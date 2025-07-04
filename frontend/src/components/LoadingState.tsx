import React from 'react';
import { clsx } from 'clsx';
import { useDeviceType } from '../hooks/useDeviceType';

interface LoadingStateProps {
  type: 'thinking' | 'loading' | 'connecting';
  progress?: number; // 0-100
  message?: string;
  showDetails?: boolean;
  onCancel?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  progress,
  message,
  showDetails = false,
  onCancel
}) => {
  const { isMobile } = useDeviceType();

  const getDefaultMessage = () => {
    switch (type) {
      case 'thinking':
        return isMobile ? 'Maia analyzing...' : 'Maia is analyzing the position...';
      case 'loading':
        return 'Loading...';
      case 'connecting':
        return 'Connecting to Maia...';
      default:
        return 'Please wait...';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'thinking':
        return (
          <div className="relative">
            <div className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping h-5 w-5 border border-purple-400 rounded-full opacity-20"></div>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
        );
      case 'loading':
      default:
        return (
          <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full"></div>
        );
    }
  };

  const displayMessage = message || getDefaultMessage();

  return (
    <div className={clsx(
      "flex flex-col items-center justify-center",
      "bg-gradient-to-r from-purple-500/20 to-blue-500/20",
      "border border-purple-500/30 rounded-lg shadow-lg",
      "backdrop-blur-sm",
      isMobile ? "px-4 py-3 mx-2" : "px-6 py-4"
    )}>
      {/* Icon and primary message */}
      <div className="flex items-center space-x-3 mb-2">
        {getIcon()}
        <span className={clsx(
          "font-medium",
          type === 'thinking' ? "text-purple-300" : "text-blue-300",
          isMobile ? "text-sm" : "text-base"
        )}>
          {displayMessage}
        </span>
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full mt-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={clsx(
                "h-2 rounded-full transition-all duration-300 ease-out",
                type === 'thinking' 
                  ? "bg-gradient-to-r from-purple-500 to-purple-400" 
                  : "bg-gradient-to-r from-blue-500 to-blue-400"
              )}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Additional details for debugging */}
      {showDetails && (
        <div className="mt-3 text-xs text-slate-400 text-center space-y-1">
          <div>Status: {type}</div>
          {progress !== undefined && <div>Progress: {progress.toFixed(1)}%</div>}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
        </div>
      )}

      {/* Cancel button for long operations */}
      {onCancel && (
        <button
          onClick={onCancel}
          className={clsx(
            "mt-3 px-3 py-1 text-xs",
            "bg-slate-600/50 hover:bg-slate-600/70",
            "border border-slate-500/50 rounded",
            "text-slate-300 hover:text-white",
            "transition-colors duration-200",
            "active:scale-95 transform"
          )}
        >
          Cancel
        </button>
      )}

      {/* Mobile-specific haptic feedback indicator */}
      {isMobile && type === 'thinking' && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
      )}
    </div>
  );
};