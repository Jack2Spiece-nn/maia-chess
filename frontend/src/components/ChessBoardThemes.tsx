import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ChessBoardTheme {
  id: string;
  name: string;
  description: string;
  lightSquare: string;
  darkSquare: string;
  borderColor: string;
  shadowColor: string;
  glowColor: string;
  backgroundColor: string;
  textColor: string;
  isPremium?: boolean;
}

export const chessBoardThemes: ChessBoardTheme[] = [
  {
    id: 'classic',
    name: 'Classic Wood',
    description: 'Traditional wooden chess board',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    borderColor: '#8b4513',
    shadowColor: 'rgba(139, 69, 19, 0.3)',
    glowColor: 'rgba(139, 69, 19, 0.5)',
    backgroundColor: '#3e2723',
    textColor: '#5d4e37',
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    description: 'Contemporary blue-themed board',
    lightSquare: '#e8f4f8',
    darkSquare: '#4a90a4',
    borderColor: '#2c5f70',
    shadowColor: 'rgba(74, 144, 164, 0.3)',
    glowColor: 'rgba(74, 144, 164, 0.5)',
    backgroundColor: '#1a252f',
    textColor: '#4a90a4',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Futuristic neon-themed board',
    lightSquare: '#2a2a2a',
    darkSquare: '#1a1a1a',
    borderColor: '#00ffff',
    shadowColor: 'rgba(0, 255, 255, 0.5)',
    glowColor: 'rgba(0, 255, 255, 0.8)',
    backgroundColor: '#0a0a0a',
    textColor: '#00ffff',
    isPremium: true,
  },
  {
    id: 'marble',
    name: 'Marble Elegance',
    description: 'Luxurious marble chess board',
    lightSquare: '#f5f5f5',
    darkSquare: '#696969',
    borderColor: '#404040',
    shadowColor: 'rgba(64, 64, 64, 0.3)',
    glowColor: 'rgba(64, 64, 64, 0.5)',
    backgroundColor: '#2c2c2c',
    textColor: '#696969',
    isPremium: true,
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    lightSquare: '#e8f5e8',
    darkSquare: '#4a7c59',
    borderColor: '#2d4a34',
    shadowColor: 'rgba(74, 124, 89, 0.3)',
    glowColor: 'rgba(74, 124, 89, 0.5)',
    backgroundColor: '#1a3d20',
    textColor: '#4a7c59',
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Regal purple and gold theme',
    lightSquare: '#f0e6ff',
    darkSquare: '#6b46c1',
    borderColor: '#4c1d95',
    shadowColor: 'rgba(107, 70, 193, 0.3)',
    glowColor: 'rgba(107, 70, 193, 0.5)',
    backgroundColor: '#2e1065',
    textColor: '#6b46c1',
    isPremium: true,
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm sunset-themed board',
    lightSquare: '#fff4e6',
    darkSquare: '#d97706',
    borderColor: '#92400e',
    shadowColor: 'rgba(217, 119, 6, 0.3)',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    backgroundColor: '#451a03',
    textColor: '#d97706',
  },
  {
    id: 'ice',
    name: 'Arctic Ice',
    description: 'Cool ice-themed board',
    lightSquare: '#f0f9ff',
    darkSquare: '#0369a1',
    borderColor: '#075985',
    shadowColor: 'rgba(3, 105, 161, 0.3)',
    glowColor: 'rgba(3, 105, 161, 0.5)',
    backgroundColor: '#0c4a6e',
    textColor: '#0369a1',
    isPremium: true,
  },
];

interface ChessBoardThemeContextType {
  currentTheme: ChessBoardTheme;
  setTheme: (themeId: string) => void;
  availableThemes: ChessBoardTheme[];
  isThemeUnlocked: (themeId: string) => boolean;
  unlockTheme: (themeId: string) => void;
}

const ChessBoardThemeContext = createContext<ChessBoardThemeContextType | undefined>(undefined);

export const useChessBoardTheme = () => {
  const context = useContext(ChessBoardThemeContext);
  if (!context) {
    throw new Error('useChessBoardTheme must be used within a ChessBoardThemeProvider');
  }
  return context;
};

interface ChessBoardThemeProviderProps {
  children: React.ReactNode;
}

export const ChessBoardThemeProvider: React.FC<ChessBoardThemeProviderProps> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('classic');
  const [unlockedThemes, setUnlockedThemes] = useState<Set<string>>(new Set(['classic', 'modern', 'forest', 'sunset']));

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('chessBoardTheme');
    if (savedTheme && chessBoardThemes.some(theme => theme.id === savedTheme)) {
      setCurrentThemeId(savedTheme);
    }

    const savedUnlocked = localStorage.getItem('unlockedChessThemes');
    if (savedUnlocked) {
      try {
        const unlocked = JSON.parse(savedUnlocked);
        setUnlockedThemes(new Set(unlocked));
      } catch (error) {
        console.error('Error loading unlocked themes:', error);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chessBoardTheme', currentThemeId);
  }, [currentThemeId]);

  // Save unlocked themes to localStorage
  useEffect(() => {
    localStorage.setItem('unlockedChessThemes', JSON.stringify([...unlockedThemes]));
  }, [unlockedThemes]);

  const currentTheme = chessBoardThemes.find(theme => theme.id === currentThemeId) || chessBoardThemes[0];

  const setTheme = (themeId: string) => {
    if (isThemeUnlocked(themeId)) {
      setCurrentThemeId(themeId);
    }
  };

  const isThemeUnlocked = (themeId: string) => {
    const theme = chessBoardThemes.find(t => t.id === themeId);
    return !theme?.isPremium || unlockedThemes.has(themeId);
  };

  const unlockTheme = (themeId: string) => {
    setUnlockedThemes(prev => new Set([...prev, themeId]));
  };

  const value: ChessBoardThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: chessBoardThemes,
    isThemeUnlocked,
    unlockTheme,
  };

  return (
    <ChessBoardThemeContext.Provider value={value}>
      {children}
    </ChessBoardThemeContext.Provider>
  );
};

export default ChessBoardThemeProvider;