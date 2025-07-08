/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced theme-aware colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        chess: {
          light: '#f0d9b5',
          dark: '#b58863',
          highlight: '#646cff',
          check: '#ff6b6b',
          move: '#4ecdc4',
          capture: '#ff9500',
          selection: '#7dd3fc',
          // Enhanced chess colors
          'light-square': '#f0d9b5',
          'dark-square': '#b58863',
          'highlight-move': '#90ee90',
          'highlight-capture': '#ff6b6b',
          'last-move': '#ffd700',
          'check-warning': '#ff4444',
          'selection-active': '#4169e1',
          'premium-gold': '#ffd700',
          'premium-silver': '#c0c0c0',
          'premium-bronze': '#cd7f32',
        },
        // Theme-aware surface colors
        surface: {
          light: '#ffffff',
          dark: '#1f2937',
          'light-secondary': '#f9fafb',
          'dark-secondary': '#374151',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
          'light-strong': 'rgba(255, 255, 255, 0.2)',
          'dark-strong': 'rgba(0, 0, 0, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        chess: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'chess-move': 'chessMove 0.3s ease-out',
        'capture-effect': 'captureEffect 0.5s ease-out',
        // Enhanced animations
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'particle-float': 'particleFloat 12s ease-in-out infinite',
        'theme-transition': 'themeTransition 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'rotate-in': 'rotateIn 0.4s ease-out',
        'chess-piece-hover': 'chessPieceHover 0.2s ease-out',
        'board-highlight': 'boardHighlight 0.3s ease-out',
        'neon-glow': 'neonGlow 2s ease-in-out infinite',
        'morphing-gradient': 'morphingGradient 20s ease-in-out infinite',
        'board-shimmer': 'boardShimmer 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(2deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        chessMove: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        captureEffect: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
          '100%': { opacity: '0', transform: 'scale(1.5)' },
        },
        // Enhanced keyframes
        gradientShift: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            transform: 'rotate(0deg)',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            transform: 'rotate(1deg)',
          },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-30px) rotate(120deg)' },
          '66%': { transform: 'translateY(15px) rotate(240deg)' },
        },
        themeTransition: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(99, 102, 241, 0.3)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
            transform: 'scale(1.02)',
          },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-10deg) scale(0.8)' },
          '100%': { opacity: '1', transform: 'rotate(0deg) scale(1)' },
        },
        chessPieceHover: {
          '0%': { transform: 'scale(1) translateY(0px)' },
          '50%': { transform: 'scale(1.08) translateY(-4px)' },
          '100%': { transform: 'scale(1.05) translateY(-2px)' },
        },
        boardHighlight: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        neonGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(168, 85, 247, 0.3), 0 0 10px rgba(168, 85, 247, 0.2), 0 0 15px rgba(168, 85, 247, 0.1)',
          },
          '50%': { 
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.2)',
          },
        },
        morphingGradient: {
          '0%': { 
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          },
          '25%': { 
            background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
          },
          '50%': { 
            background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
          },
          '75%': { 
            background: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
          },
          '100%': { 
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          },
        },
        boardShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sparkle: {
          '0%, 100%': { 
            opacity: '0', 
            transform: 'scale(0) rotate(0deg)',
          },
          '50%': { 
            opacity: '1', 
            transform: 'scale(1) rotate(180deg)',
          },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1680px',
        'touch': { 'raw': '(pointer: coarse)' },
        'no-touch': { 'raw': '(pointer: fine)' },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderWidth: {
        '3': '3px',
      },
      blur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-lg': '0 0 40px rgba(168, 85, 247, 0.4)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}