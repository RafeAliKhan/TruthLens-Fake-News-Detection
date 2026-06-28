import React, { useState } from 'react';
import { Search, Loader, Link, Newspaper, ChevronRight, Zap } from 'lucide-react';
import { analyzeArticle } from '../utils/api';
import { VerdictCard } from '../components/VerdictCard';
import type { AnalysisResult } from '../types';

const EXAMPLES = [
  {
    label: 'Fake Example',
    title: 'SHOCKING: Government EXPOSED in massive cover-up conspiracy!',
    content: 'You WILL NOT BELIEVE what they are hiding from you! Exclusive leaked documents prove the deep state conspiracy against innocent citizens. WAKE UP SHEEPLE! Share this before they DELETE it! Bombshell revelation exposes the secret cabal controlling everything.',
    type: 'fake'
  },
  {
    label: 'Real Example',
    title: 'Federal Reserve raises interest rates by 25 basis points amid inflation concerns',
    content: 'The Federal Reserve announced an increase in the federal funds rate following several months of analysis of economic data showing persistent inflation. Officials cited employment statistics and consumer price index data according to statements released by the central bank. The decision follows deliberation by committee members reviewing data from multiple economic sectors.',
    type: 'real'
  },
];

export const AnalyzePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and article content.');
      return;
    }
    setError('');
    setResult(null);
    setScanning(true);
    setTimeout(() => setScanning(false), 1800);
    setLoading(true);
    try {
      const res = await analyzeArticle(title, content, source || undefined, url || undefined);
      setResult(res);
    } catch {
      setError('Analysis failed. Is the backend server running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setTitle(ex.title);
    setContent(ex.content);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium"
          style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
          <Zap size={12} />
          NLP + TF-IDF + Machine Learning
        </div>
        <h1 className="font-display font-700 text-4xl text-white mb-3">
          Detect Fake News with <span style={{ color: '#00D4FF' }}>AI Precision</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: '#718096' }}>
          Paste any news article to get an instant credibility analysis powered by NLP preprocessing, TF-IDF vectorization, and logistic regression classification.
        </p>
      </div>

      {/* Quick Examples */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {EXAMPLES.map((ex) => (
          <button key={ex.label} onClick={() => loadExample(ex)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{
              background: ex.type === 'fake' ? 'rgba(255,75,110,0.1)' : 'rgba(0,200,81,0.1)',
              color: ex.type === 'fake' ? '#FF4B6E' : '#00C851',
              border: `1px solid ${ex.type === 'fake' ? 'rgba(255,75,110,0.2)' : 'rgba(0,200,81,0.2)'}`,
            }}>
            Load {ex.label} <ChevronRight size={14} />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5 font-display uppercase tracking-wider"
              style={{ color: '#718096' }}>
              <Newspaper size={12} className="inline mr-1" /> Article Title *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter the news article headline..."
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
              style={{ background: '#141B2D', border: '1px solid #1A2340' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
              onBlur={e => (e.target.style.borderColor = '#1A2340')}
            />
          </div>

          {/* Content */}
          <div className="relative">
            <label className="block text-xs font-medium mb-1.5 font-display uppercase tracking-wider"
              style={{ color: '#718096' }}>
              Article Content *
            </label>
            <div className="relative overflow-hidden rounded-xl">
              {scanning && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="scan-beam w-full h-1 rounded"
                    style={{ background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)', opacity: 0.7 }} />
                </div>
              )}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste the full article content here for analysis..."
                rows={7}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
                style={{ background: '#141B2D', border: '1px solid #1A2340' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                onBlur={e => (e.target.style.borderColor = '#1A2340')}
              />
            </div>
            <div className="text-xs mt-1 text-right" style={{ color: '#4A5568' }}>
              {content.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#4A5568' }}>
                Source (optional)
              </label>
              <input value={source} onChange={e => setSource(e.target.value)}
                placeholder="e.g. CNN, Fox News..."
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none"
                style={{ background: '#141B2D', border: '1px solid #1A2340' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#4A5568' }}>
                <Link size={11} className="inline mr-1" />URL (optional)
              </label>
              <input value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none"
                style={{ background: '#141B2D', border: '1px solid #1A2340' }} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(255,75,110,0.1)', color: '#FF4B6E', border: '1px solid rgba(255,75,110,0.2)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full mt-5 py-3.5 rounded-xl font-display font-600 text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: loading ? '#1A2340' : 'linear-gradient(135deg, #00D4FF, #0090B3)',
            color: loading ? '#4A5568' : '#0A0E1A',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? (
            <><Loader size={16} className="animate-spin" />Analyzing with AI…</>
          ) : (
            <><Search size={16} />Analyze Article</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && <VerdictCard result={result} />}
    </div>
  );
};
