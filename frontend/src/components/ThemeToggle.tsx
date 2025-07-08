import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useDeviceType } from '../hooks/useDeviceType';
import { clsx } from 'clsx';

export const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, setTheme } = useTheme();
  const { isMobile } = useDeviceType();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'auto' as const, icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="relative">
      <div className={clsx(
        "flex items-center p-1 rounded-xl transition-all duration-200",
        "bg-white/10 backdrop-blur-sm border border-white/20",
        actualTheme === 'dark' ? 'bg-white/5' : 'bg-black/5'
      )}>
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={clsx(
              "relative flex items-center justify-center transition-all duration-200",
              "rounded-lg font-medium text-sm",
              isMobile ? "px-2 py-1.5 min-w-[44px]" : "px-3 py-2",
              theme === value ? [
                "bg-white text-gray-900 shadow-lg",
                actualTheme === 'dark' && "bg-gray-800 text-white"
              ] : [
                "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                actualTheme === 'dark' && "text-gray-300 hover:text-white hover:bg-white/10"
              ],
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              actualTheme === 'dark' && "focus:ring-offset-gray-900"
            )}
            aria-label={`Switch to ${label} theme`}
            title={`Switch to ${label} theme`}
          >
            <Icon className={clsx("w-4 h-4", !isMobile && "mr-1")} />
            {!isMobile && (
              <span className="hidden sm:inline">{label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};