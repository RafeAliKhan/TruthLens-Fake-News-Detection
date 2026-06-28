import React from 'react';
import { Shield, Search, BarChart3, Clock, Zap } from 'lucide-react';

type Page = 'analyze' | 'history' | 'dashboard';

interface Props {
  page: Page;
  setPage: (p: Page) => void;
}

export const Navbar: React.FC<Props> = ({ page, setPage }) => {
  const nav = [
    { id: 'analyze' as Page, label: 'Analyze', icon: Search },
    { id: 'history' as Page, label: 'History', icon: Clock },
    { id: 'dashboard' as Page, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav style={{ background: '#0F1525', borderBottom: '1px solid #1A2340' }}
      className="sticky top-0 z-50 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('analyze')}>
          <div className="relative">
            <Shield size={28} style={{ color: '#00D4FF' }} />
            <Zap size={12} className="absolute -bottom-0.5 -right-0.5"
              style={{ color: '#FFB800' }} />
          </div>
          <div>
            <span className="font-display font-700 text-white text-lg tracking-tight">
              Truth<span style={{ color: '#00D4FF' }}>Lens</span>
            </span>
            <div className="text-xs" style={{ color: '#4A5568', marginTop: -2 }}>
              AI Fake News Detector
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: page === id ? '#00D4FF' : '#718096',
                background: page === id ? 'rgba(0,212,255,0.1)' : 'transparent',
                border: page === id ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs" style={{ color: '#4A5568' }}>
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-ring" />
          <span>API Online</span>
        </div>
      </div>
    </nav>
  );
};
