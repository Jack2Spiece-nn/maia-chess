import React from 'react';
import { ChessGame } from './components/ChessGame';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ChessGame />
      </main>
    </div>
  );
}

export default App;