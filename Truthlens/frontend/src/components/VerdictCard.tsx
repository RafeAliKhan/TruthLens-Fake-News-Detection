import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, Clock, Tag } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { getVerdictConfig, formatDate } from '../utils/helpers';

interface Props {
  result: AnalysisResult;
  compact?: boolean;
}

const VerdictIcon: React.FC<{ verdict: string; size?: number }> = ({ verdict, size = 20 }) => {
  if (verdict === 'FAKE') return <XCircle size={size} />;
  if (verdict === 'SUSPICIOUS') return <AlertTriangle size={size} />;
  if (verdict === 'CREDIBLE') return <CheckCircle size={size} />;
  return <HelpCircle size={size} />;
};

const ScoreBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1" style={{ color: '#718096' }}>
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-2 rounded-full" style={{ background: '#1A2340' }}>
      <div className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);

export const VerdictCard: React.FC<Props> = ({ result, compact = false }) => {
  const cfg = getVerdictConfig(result.verdict);

  if (compact) {
    return (
      <div className="rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-[1.01] cursor-pointer"
        style={{ background: '#1A1F2E', border: `1px solid ${cfg.border}` }}>
        <div className="rounded-lg p-2 flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}>
          <VerdictIcon verdict={result.verdict} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{result.title}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-display font-600" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
            <span className="text-xs" style={{ color: '#4A5568' }}>
              {result.confidence}% confidence
            </span>
          </div>
        </div>
        <div className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: '#4A5568' }}>
          <Clock size={11} />
          {formatDate(result.timestamp)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl fade-in" style={{ background: '#1A1F2E', border: `1px solid ${cfg.border}` }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: '#1A2340' }}>
        <div className="flex items-start gap-4">
          <div className="rounded-xl p-3 flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
            <VerdictIcon verdict={result.verdict} size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="font-display font-700 text-xl" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {result.confidence}% confidence
              </span>
            </div>
            <p className="text-sm" style={{ color: '#718096' }}>{cfg.desc}</p>
            <p className="text-white font-medium mt-2 leading-snug">{result.title}</p>
            {result.source && (
              <div className="flex items-center gap-1 mt-1">
                <Tag size={11} style={{ color: '#4A5568' }} />
                <span className="text-xs" style={{ color: '#4A5568' }}>{result.source}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="p-6 grid grid-cols-2 gap-4 border-b" style={{ borderColor: '#1A2340' }}>
        <ScoreBar label="Fake Probability" value={result.fake_score} color="#FF4B6E" />
        <ScoreBar label="Credibility Score" value={result.real_score} color="#00C851" />
      </div>

      {/* Signals */}
      {result.signals.length > 0 && (
        <div className="p-6 border-b" style={{ borderColor: '#1A2340' }}>
          <h4 className="text-xs uppercase tracking-widest mb-3 font-display font-600"
            style={{ color: '#4A5568' }}>Analysis Signals</h4>
          <div className="space-y-2">
            {result.signals.map((sig, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3"
                style={{
                  background: sig.type === 'warning' ? 'rgba(255,75,110,0.07)' :
                    sig.type === 'positive' ? 'rgba(0,200,81,0.07)' : 'rgba(160,174,192,0.07)',
                  border: `1px solid ${sig.type === 'warning' ? 'rgba(255,75,110,0.15)' :
                    sig.type === 'positive' ? 'rgba(0,200,81,0.15)' : 'rgba(160,174,192,0.1)'}`,
                }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    background: sig.type === 'warning' ? '#FF4B6E' :
                      sig.type === 'positive' ? '#00C851' : '#718096'
                  }} />
                <div>
                  <div className="text-xs font-medium text-white">{sig.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#718096' }}>{sig.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Metrics */}
      <div className="p-6 border-b" style={{ borderColor: '#1A2340' }}>
        <h4 className="text-xs uppercase tracking-widest mb-3 font-display font-600"
          style={{ color: '#4A5568' }}>Text Metrics</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Words', value: result.features.word_count },
            { label: 'Sentences', value: result.features.sentence_count },
            { label: 'Exclamations', value: result.features.exclamation_marks },
            { label: 'Caps %', value: `${result.features.caps_ratio}%` },
            { label: 'Sensational', value: result.features.sensational_words },
            { label: 'Credible Cues', value: result.features.credible_indicators },
            { label: 'Avg Sent Len', value: result.features.avg_sentence_length },
            { label: 'NLP Tokens', value: result.preprocessed_length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ background: '#141B2D' }}>
              <div className="font-display font-700 text-lg" style={{ color: '#00D4FF' }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Terms */}
      {result.important_words.length > 0 && (
        <div className="p-6">
          <h4 className="text-xs uppercase tracking-widest mb-3 font-display font-600"
            style={{ color: '#4A5568' }}>TF-IDF Key Terms</h4>
          <div className="flex flex-wrap gap-2">
            {result.important_words.slice(0, 10).map((kw, i) => (
              <span key={i}
                className="px-3 py-1 rounded-full text-xs font-mono"
                style={{
                  background: '#141B2D',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.15)',
                  opacity: 0.4 + kw.weight * 3,
                }}>
                {kw.word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
