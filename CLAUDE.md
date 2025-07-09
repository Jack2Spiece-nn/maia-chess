# Maia Chess - Claude Context Document

## Project Overview

Maia Chess is a sophisticated web-based chess application that allows users to play against AI opponents trained on human games. The project combines cutting-edge AI technology with a modern, responsive user interface to create an engaging chess experience.

## Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Chess Logic**: chess.js library
- **Chess Board**: react-chessboard component
- **State Management**: React hooks and context
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React

### Backend Stack
- **Framework**: Flask (Python)
- **Chess Engine**: Maia AI models (multiple skill levels 1100-1900)
- **Model Format**: Protocol Buffers (.pb.gz files)
- **CORS**: Flask-CORS for cross-origin requests
- **Performance**: Built-in caching and metrics

### Deployment
- **Platform**: Render.com
- **Frontend**: Static site deployment
- **Backend**: Docker container deployment
- **Environment**: Production-ready configuration

## Key Features

### Core Functionality
1. **Interactive Chess Game**: Full chess implementation with move validation
2. **AI Opponents**: Multiple Maia AI skill levels (1100-1900 rating)
3. **Move Methods**: Both drag-and-drop and click-to-move support
4. **Game Controls**: New game, resignation, move history
5. **Real-time Status**: Live game state updates and notifications

### Advanced UI/UX Features
1. **Modern Design System**: Comprehensive color palette, typography, and spacing
2. **Glass-Morphism Effects**: Advanced backdrop blur and transparency effects
3. **Particle System**: Dynamic background particles and ambient animations
4. **Advanced Animations**: Smooth transitions, micro-interactions, and visual feedback
5. **Chess Board Themes**: Multiple board themes including premium options
6. **Responsive Design**: Mobile-first design with touch optimizations

### Mobile Experience
1. **Touch Optimizations**: Large touch targets, haptic feedback
2. **Gesture Support**: Swipe gestures and touch interactions
3. **Performance Monitoring**: Real-time performance metrics
4. **Offline Capabilities**: Basic offline mode support
5. **PWA Features**: Progressive web app functionality

## File Structure

```
maia-chess/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChessGame.tsx          # Main game component
│   │   │   ├── Header.tsx             # Enhanced header with animations
│   │   │   ├── GameControls.tsx       # Game control buttons
│   │   │   ├── GameStatus.tsx         # Game state display
│   │   │   ├── AiSettings.tsx         # AI configuration
│   │   │   ├── MoveHistory.tsx        # Move tracking
│   │   │   ├── LoadingState.tsx       # Enhanced loading animations
│   │   │   ├── ParticleSystem.tsx     # Dynamic particle effects
│   │   │   ├── RippleEffect.tsx       # Interactive ripple effects
│   │   │   ├── NotificationSystem.tsx # Advanced notifications
│   │   │   ├── ThemeSelector.tsx      # Chess board theme selector
│   │   │   ├── ChessBoardThemes.tsx   # Theme management system
│   │   │   ├── SoundSettings.tsx      # Audio configuration
│   │   │   └── ThemeToggle.tsx        # Light/dark mode toggle
│   │   ├── hooks/
│   │   │   ├── useChessGame.ts        # Game state management
│   │   │   ├── useDeviceType.ts       # Device detection
│   │   │   ├── useTheme.tsx           # Theme management
│   │   │   ├── useSound.ts            # Audio system
│   │   │   ├── useHapticFeedback.ts   # Mobile haptic feedback
│   │   │   ├── usePerformanceMonitor.ts # Performance tracking
│   │   │   └── useValidation.ts       # Input validation
│   │   ├── services/
│   │   │   └── api.ts                 # Backend API integration
│   │   ├── types/
│   │   │   └── game.ts                # TypeScript definitions
│   │   ├── App.tsx                    # Main app component
│   │   ├── main.tsx                   # App entry point
│   │   └── index.css                  # Advanced CSS with animations
│   ├── public/
│   │   ├── favicon.ico
│   │   └── chess-icon.svg
│   ├── package.json                   # Dependencies and scripts
│   ├── tailwind.config.js             # Enhanced Tailwind configuration
│   ├── vite.config.ts                 # Vite configuration
│   └── tsconfig.json                  # TypeScript configuration
├── backend/
│   ├── app.py                         # Flask application
│   ├── maia_engine.py                 # AI engine integration
│   ├── models/                        # AI model files
│   ├── requirements.txt               # Python dependencies
│   └── Dockerfile                     # Container configuration
├── render.yaml                        # Deployment configuration
└── README.md                          # Project documentation
```

## Design System

### Color Palette
- **Primary**: Blue tones (#0ea5e9 to #0c4a6e)
- **Secondary**: Purple tones (#d946ef to #4a044e)
- **Accent**: Orange tones (#f97316 to #431407)
- **Neutral**: Gray scale (#fafafa to #0a0a0a)
- **Semantic**: Success, warning, error states
- **Chess**: Board-specific colors and themes

### Typography
- **Primary Font**: Inter Variable (supports weight 100-900)
- **Display Font**: Cal Sans (for headings)
- **Monospace**: JetBrains Mono (for code/data)
- **Responsive Sizing**: xs (12px) to 9xl (128px)

### Animation System
- **Durations**: 200ms (fast), 300ms (normal), 500ms (slow)
- **Easing**: Custom cubic-bezier functions
- **Types**: Fade, slide, bounce, scale, rotate, sparkle, ripple
- **Performance**: GPU-accelerated transforms

## API Integration

### Backend Endpoints
- `POST /api/move` - Make a move and get AI response
- `GET /api/health` - Health check
- `GET /api/metrics` - Performance metrics

### Request/Response Format
```typescript
interface MoveRequest {
  fen: string;
  move: string;
  aiLevel: number;
  aiNodes?: number;
}

interface MoveResponse {
  success: boolean;
  aiMove?: string;
  newFen?: string;
  gameStatus?: string;
  error?: string;
}
```

## Testing

### Test Files
- `backend/test_app.py` - Backend API tests
- `backend/test_maia_engine.py` - AI engine tests
- `backend/test_integration.py` - Integration tests
- `backend/test_validation.py` - Input validation tests

### Test Commands
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Development

### Local Development
```bash
# Start backend
cd backend
python app.py

# Start frontend
cd frontend
npm install
npm run dev
```

### Build Process
```bash
# Build frontend
cd frontend
npm run build

# Build backend (Docker)
cd backend
docker build -t maia-chess-backend .
```

## Performance Optimizations

### Frontend
1. **React Optimizations**: React.memo, useMemo, useCallback
2. **Bundle Splitting**: Lazy loading of components
3. **Asset Optimization**: Image compression and lazy loading
4. **Caching**: Browser caching and service worker
5. **Animations**: GPU-accelerated CSS transforms

### Backend
1. **Model Caching**: In-memory model loading
2. **Response Caching**: Move prediction caching
3. **Connection Pooling**: Efficient database connections
4. **Metrics**: Performance monitoring and logging

## Mobile Optimizations

### Touch Experience
- **Touch Targets**: Minimum 44px tap targets
- **Haptic Feedback**: Vibration for moves and events
- **Gesture Support**: Swipe, pinch, and touch gestures
- **Performance**: 60fps animations and smooth scrolling

### Responsive Design
- **Breakpoints**: Mobile (0-767px), Tablet (768-1023px), Desktop (1024px+)
- **Layouts**: Adaptive layouts for different screen sizes
- **Typography**: Responsive font scaling
- **Images**: Responsive images with srcset

## Security

### Frontend Security
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: CSRF tokens for forms
- **Content Security**: Secure content loading policies

### Backend Security
- **CORS**: Configured for frontend domain
- **Input Validation**: Move validation and sanitization
- **Rate Limiting**: API rate limiting protection

## Deployment

### Render Configuration
```yaml
services:
  - type: web
    name: maia-chess-backend
    env: docker
    dockerfilePath: backend/Dockerfile
    plan: free

  - type: web
    name: maia-chess-frontend
    env: node
    buildCommand: cd frontend && npm ci && npm run build
    startCommand: cd frontend && npm run preview
    envVars:
      - key: VITE_API_URL
        value: https://maia-chess-backend.onrender.com
```

### Environment Variables
- `VITE_API_URL`: Backend API URL
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (auto-assigned by Render)

## Monitoring

### Performance Metrics
- **FPS**: Render frame rate monitoring
- **API Response Time**: Backend latency tracking
- **Touch Latency**: Mobile interaction responsiveness
- **Network Status**: Connection quality monitoring

### Error Tracking
- **Console Logging**: Structured logging system
- **Error Boundaries**: React error boundaries
- **Validation Logging**: Input validation tracking
- **Performance Logging**: Resource usage tracking

## Future Enhancements

### Planned Features
1. **User Accounts**: Registration and profile management
2. **Game History**: Persistent game storage
3. **Tournaments**: Multiplayer tournament system
4. **Analysis Tools**: Move analysis and suggestions
5. **Training Mode**: Chess puzzle system
6. **Social Features**: Share games and achievements

### Technical Improvements
1. **WebSocket Integration**: Real-time multiplayer
2. **Service Worker**: Enhanced offline capabilities
3. **Database Integration**: PostgreSQL for data persistence
4. **AI Improvements**: Additional engine options
5. **Performance**: Further optimization and caching

## Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and React best practices
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Performance**: Consider performance impact of changes
5. **Accessibility**: Ensure accessibility compliance

### Git Workflow
1. **Branching**: Feature branches from main
2. **Commits**: Descriptive commit messages
3. **Pull Requests**: Code review process
4. **Testing**: All tests must pass before merge

This document provides comprehensive context for AI assistants working on the Maia Chess project. It covers the architecture, features, development process, and deployment strategy to enable effective collaboration and development.