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
  const { isMobile } = useDeviceType();

  return (
    <div className={clsx(
      "min-h-screen relative overflow-x-hidden transition-all duration-300",
      isMobile && "min-h-screen"
    )}>
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
          <div className="h-4" />
          
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