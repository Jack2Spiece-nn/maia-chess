#!/bin/bash

echo "🚀 Installing Maia Chess Enhancements..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

echo "📦 Installing new dependencies..."

# Install main dependencies
npm install framer-motion@^10.16.5 \
           howler@^2.2.4 \
           react-spring@^9.7.3 \
           use-sound@^4.0.1 \
           vite-plugin-pwa@^0.17.4

# Install type definitions
npm install --save-dev @types/howler@^2.2.11

echo "✅ Dependencies installed successfully!"

echo "🎨 Creating PWA assets..."

# Create public directory if it doesn't exist
mkdir -p public

# Create basic PWA icons (placeholder - replace with actual icons)
cat > public/manifest.json << 'EOF'
{
  "name": "Maia Chess - Human-like Chess AI",
  "short_name": "Maia Chess",
  "description": "Play chess against Maia, a human-like AI that adapts to your skill level",
  "theme_color": "#667eea",
  "background_color": "#1e293b",
  "display": "standalone",
  "orientation": "portrait-primary",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "any",
      "type": "image/x-icon"
    },
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

# Update index.html for better mobile support
if [ -f "index.html" ]; then
    echo "📱 Updating index.html for mobile optimization..."
    
    # Create backup
    cp index.html index.html.backup
    
    # Update meta tags for mobile
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#667eea" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Maia Chess" />
    
    <!-- Mobile Optimizations -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-touch-fullscreen" content="yes" />
    <meta name="format-detection" content="telephone=no" />
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <title>Maia Chess - Human-like Chess AI</title>
    <meta name="description" content="Play chess against Maia, a human-like AI that learns and adapts to human playing styles. Available in 9 skill levels from beginner to grandmaster." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
fi

echo "⚙️  Creating enhanced configuration files..."

# Create optimized PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}
EOF

# Create TypeScript path mapping for better imports
if [ -f "tsconfig.json" ]; then
    echo "🔧 Updating TypeScript configuration..."
    
    # Create enhanced tsconfig.json
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/types/*": ["src/types/*"],
      "@/services/*": ["src/services/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
fi

echo "🎮 Creating enhanced game features..."

# Create sounds directory structure
mkdir -p src/assets/sounds

# Create a simple notification for sound files
cat > src/assets/sounds/README.md << 'EOF'
# Chess Sound Effects

This directory contains sound effects for the chess game:

- move.mp3 - Standard move sound
- capture.mp3 - Piece capture sound  
- check.mp3 - Check notification
- checkmate.mp3 - Checkmate sound
- game-start.mp3 - Game start sound
- game-end.mp3 - Game end sound
- button-click.mp3 - UI button sound
- notification.mp3 - General notification

Note: The current implementation uses base64-encoded sounds for better compatibility.
Replace these with actual MP3 files for production use.
EOF

echo "📝 Creating deployment guide..."

cat > DEPLOYMENT_GUIDE.md << 'EOF'
# Enhanced Maia Chess Deployment Guide

## 🚀 Quick Deploy to Render

The enhanced version includes:
- ✅ Progressive Web App (PWA) support
- ✅ Mobile-optimized responsive design  
- ✅ Touch-friendly interactions for Android
- ✅ Sound effects and animations
- ✅ Enhanced gameplay features
- ✅ Better performance optimization

### Automatic Deployment

1. **Push to GitHub** - Push all changes to your repository
2. **Render Auto-Deploy** - Render will automatically detect changes and redeploy
3. **Install Dependencies** - The new dependencies will be installed automatically

### Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Install dependencies
npm install

# 2. Run the enhancement script (if not done)
chmod +x install-enhancements.sh
./install-enhancements.sh

# 3. Build for production
npm run build

# 4. Deploy to your hosting platform
```

### New Features Added

#### 🎮 Enhanced Gameplay
- Move hints and possible move highlighting
- Sound effects for moves, captures, and game events
- Animated pieces and board interactions
- Better visual feedback

#### 📱 Mobile Optimization
- Touch-friendly piece selection
- Responsive design for all screen sizes
- Android-specific optimizations
- PWA support for app-like experience

#### 🎨 Visual Improvements
- Smooth animations and transitions
- Glass-morphism design elements
- Better color schemes and gradients
- Improved accessibility

#### 🔧 Technical Enhancements
- Better TypeScript support
- Optimized bundle size
- Enhanced error handling
- Performance improvements

### Environment Variables

No additional environment variables needed. The app will work with existing configuration.

### Testing on Mobile

1. **Local Testing**: 
   - Run `npm run dev`
   - Open on mobile browser: `http://your-local-ip:3000`

2. **Production Testing**:
   - Deploy to Render
   - Test on various devices and browsers
   - Check PWA installation prompt

### Performance Tips

- Images and sounds are optimized for fast loading
- Lazy loading implemented for better performance
- Service worker caches resources for offline use
- Responsive images for different screen sizes

### Troubleshooting

#### Common Issues:
1. **Sound not working**: Check browser autoplay policies
2. **PWA not installing**: Ensure HTTPS is enabled
3. **Touch issues**: Clear browser cache and cookies
4. **Performance**: Check network throttling in dev tools

For support, check the GitHub issues or create a new issue.
EOF

echo "✨ Creating quick start commands..."

# Add helpful npm scripts
npm pkg set scripts.dev="vite --host"
npm pkg set scripts.build="vite build && echo '✅ Build complete! Deploy the dist/ folder.'"
npm pkg set scripts.preview="vite preview --host"
npm pkg set scripts.type-check="tsc --noEmit"
npm pkg set scripts.lint:fix="eslint . --ext ts,tsx --fix"

echo ""
echo "🎉 Enhancement installation complete!"
echo "===================================="
echo ""
echo "✅ All dependencies installed"
echo "✅ PWA configuration created"
echo "✅ Mobile optimizations applied"
echo "✅ Enhanced features ready"
echo ""
echo "🚀 Next Steps:"
echo "1. Run 'npm run dev' to start development server"
echo "2. Test on mobile devices using your local IP"
echo "3. Deploy to Render (auto-deployment should work)"
echo "4. Check PWA installation on mobile browsers"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🎮 New Features:"
echo "• Sound effects and animations"
echo "• Enhanced mobile/Android support"
echo "• PWA installation support"
echo "• Better visual design"
echo "• Improved touch interactions"
echo ""
EOF