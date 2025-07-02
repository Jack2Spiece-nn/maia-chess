import { ChessGame } from './components/ChessGame';
import { Header } from './components/Header';
import { useDeviceType } from './hooks/useDeviceType';
import { clsx } from 'clsx';

function App() {
  const { isMobile } = useDeviceType();

  return (
    <div className={clsx(
      "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
      "relative overflow-x-hidden",
      isMobile && "min-h-screen"
    )}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
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