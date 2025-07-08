import { ChessGame } from './components/ChessGame';
import { Header } from './components/Header';
import { useDeviceType } from './hooks/useDeviceType';
import { ThemeProvider } from './hooks/useTheme';
import { clsx } from 'clsx';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { isMobile, isTablet, orientation } = useDeviceType();

  const isMobileLayout = isMobile || (isTablet && orientation === 'portrait');

  return (
    <div className={clsx(
      "min-h-screen relative overflow-x-hidden transition-all duration-500",
      "flex flex-col",
      isMobile && "min-h-screen"
    )}>
      {/* Enhanced Header */}
      <Header />
      
      {/* Main Content Area */}
      <main className={clsx(
        "flex-1 relative z-10",
        isMobileLayout 
          ? "px-0 py-3 flex flex-col" 
          : "container mx-auto px-6 py-8"
      )}>
        {/* Content Wrapper */}
        <div className={clsx(
          "w-full max-w-7xl mx-auto",
          !isMobileLayout && "min-h-[calc(100vh-120px)]"
        )}>
          <ChessGame />
        </div>
      </main>

      {/* Enhanced Mobile Features */}
      {isMobile && (
        <>
          {/* Safe area spacer for devices with notches */}
          <div className="h-safe-bottom bg-transparent" />
          
          {/* Performance and connection indicators */}
          <div className="fixed bottom-4 left-4 z-50 flex flex-col space-y-2 opacity-60">
            {/* Online status indicator */}
            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse border-2 border-white/50"></div>
          </div>

          {/* Enhanced corner decoration */}
          <div className="fixed bottom-4 right-4 z-40 opacity-30">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 animate-ping opacity-20"></div>
              <div className="absolute inset-1 w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse opacity-30"></div>
              <div className="relative w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg"></div>
            </div>
          </div>
        </>
      )}

      {/* Desktop enhancements */}
      {!isMobile && (
        <>
          {/* Floating decorative elements */}
          <div className="fixed top-1/4 left-8 z-0 opacity-20 pointer-events-none">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400/30 to-indigo-500/30 rounded-full blur-xl animate-float"></div>
          </div>
          <div className="fixed bottom-1/4 right-8 z-0 opacity-20 pointer-events-none">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Subtle grid pattern overlay */}
          <div className="fixed inset-0 z-0 opacity-5 pointer-events-none">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
          </div>
        </>
      )}

      {/* Global loading overlay for future use */}
      <div id="global-loading-overlay" className="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto">
              <div className="loading-spinner w-full h-full"></div>
            </div>
            <p className="text-white font-semibold">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;