import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { DashboardPage } from './pages/DashboardPage';

type Page = 'analyze' | 'history' | 'dashboard';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('analyze');

  return (
    <div className="min-h-screen" style={{ background: '#0A0E1A' }}>
      <Navbar page={page} setPage={setPage} />
      <main>
        {page === 'analyze' && <AnalyzePage />}
        {page === 'history' && <HistoryPage />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
      <footer className="text-center py-8 text-xs" style={{ color: '#2D3748' }}>
        TruthLens — AI-powered Fake News Detection · FastAPI + React + NLP
      </footer>
    </div>
  );
};

export default App;
