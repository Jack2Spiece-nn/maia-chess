# Maia Chess Frontend

A modern, responsive React frontend for the Maia Chess engine - an AI trained on millions of human games to play human-like chess at different skill levels.

![Maia Chess](https://via.placeholder.com/800x400/667eea/ffffff?text=Maia+Chess+-+Human-like+AI)

## ✨ Features

- **Interactive Chess Board**: Drag-and-drop interface with beautiful piece animations
- **Human-like AI**: Play against Maia AI trained on human games (skill levels 1100-1900)
- **Real-time Game Status**: Live updates on turn, check, checkmate, and game state
- **Move History**: Complete move tracking with PGN export functionality
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Glass-morphism design with smooth animations and transitions
- **AI Difficulty Selection**: Choose from 9 different skill levels with descriptions
- **Color Choice**: Play as white or black pieces
- **Game Controls**: New game, resign, and game state management

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd maia-chess/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Backend Connection

The frontend expects the Maia Chess backend to be running on `http://localhost:5000`. 

To start the backend:
```bash
cd ../backend
python app.py
```

For production deployment, set the `VITE_API_URL` environment variable:
```bash
export VITE_API_URL=https://your-backend-api.com
npm run build
```

## 🎮 How to Play

1. **Start a New Game**: Click "New Game" and choose your color (white or black)
2. **Select Difficulty**: Use the AI Settings panel to choose Maia's skill level (1100-1900)
3. **Make Moves**: Drag and drop pieces on the board to make your moves
4. **Watch Maia Think**: The AI will respond with human-like moves based on the selected skill level
5. **Track Progress**: View move history and export games in PGN format

## 🛠️ Development

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChessGame.tsx   # Main game component
│   │   ├── GameStatus.tsx  # Game state display
│   │   ├── GameControls.tsx # Game control buttons
│   │   ├── AiSettings.tsx  # AI difficulty settings
│   │   ├── MoveHistory.tsx # Move tracking
│   │   └── Header.tsx      # App header
│   ├── hooks/
│   │   └── useChessGame.ts # Game state management
│   ├── services/
│   │   └── api.ts          # Backend API calls
│   ├── types/
│   │   └── game.ts         # TypeScript type definitions
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Technology Stack

- **React 18** - UI framework with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **react-chessboard** - Interactive chess board component
- **chess.js** - Chess game logic and move validation
- **axios** - HTTP client for API communication
- **lucide-react** - Beautiful icon library

## 🎨 UI/UX Features

- **Glass-morphism Design**: Modern translucent panels with backdrop blur
- **Smooth Animations**: Piece movements and UI transitions
- **Responsive Layout**: Adapts to different screen sizes
- **Dark Theme**: Easy on the eyes for long gaming sessions
- **Visual Feedback**: Hover states, loading indicators, and error handling
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL` - Backend API URL (defaults to `/api` for development proxy)

### Customization

The UI can be customized by modifying:
- `src/index.css` - Global styles and CSS custom properties
- `tailwind.config.js` - Tailwind theme configuration
- Component files - Individual component styling

## 🚀 Deployment

### Development Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Production Deployment

The frontend can be deployed to any static hosting service:

- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use GitHub Actions to deploy on push
- **AWS S3**: Upload the built files to an S3 bucket

### Docker Deployment

Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Maia Chess Team** - For creating the human-like chess AI
- **react-chessboard** - For the excellent chess board component
- **chess.js** - For comprehensive chess game logic
- **Tailwind CSS** - For the utility-first CSS framework

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the backend is running on port 5000
2. **Build Errors**: Clear node_modules and reinstall dependencies
3. **Styling Issues**: Verify Tailwind CSS is properly configured
4. **API Errors**: Check browser console for detailed error messages

### Getting Help

- Open an issue on GitHub
- Check the backend logs for API-related problems
- Verify all dependencies are properly installed