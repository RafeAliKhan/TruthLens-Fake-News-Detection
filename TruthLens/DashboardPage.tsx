import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { getStats } from '../utils/api';
import type { StatsData } from '../types';
import { getVerdictConfig } from '../utils/helpers';

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode }> =
  ({ label, value, sub, color = '#00D4FF', icon }) => (
    <div className="rounded-2xl p-5" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-display uppercase tracking-widest" style={{ color: '#4A5568' }}>{label}</span>
        <div className="opacity-60" style={{ color }}>{icon}</div>
      </div>
      <div className="font-display font-700 text-3xl" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#4A5568' }}>{sub}</div>}
    </div>
  );

const VERDICT_COLORS: Record<string, string> = {
  FAKE: '#FF4B6E',
  SUSPICIOUS: '#FFB800',
  UNCERTAIN: '#718096',
  CREDIBLE: '#00C851',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#1A1F2E', border: '1px solid #1A2340', color: '#E2E8F0' }}>
      <div className="font-medium mb-1" style={{ color: '#00D4FF' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader size={32} className="animate-spin" style={{ color: '#00D4FF' }} />
    </div>
  );

  if (!stats || stats.total_analyzed === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <BarChart3 size={56} className="mx-auto mb-4" style={{ color: '#1A2340' }} />
      <p style={{ color: '#4A5568' }}>No data yet. Analyze some articles to see analytics.</p>
    </div>
  );

  // Verdict distribution pie data
  const pieData = Object.entries(stats.verdict_distribution).map(([name, value]) => ({
    name, value, color: VERDICT_COLORS[name] ?? '#718096'
  }));

  // Signal frequency bar data
  const signalData = Object.entries(stats.signal_frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.replace(' ', '\n'), count }));

  // Trend line data (reverse so oldest first)
  const trendData = [...stats.recent_trend].reverse().map((t, i) => ({
    index: `#${i + 1}`,
    fake: t.fake_score,
    real: 100 - t.fake_score,
    verdict: t.verdict,
  }));

  const accuracy = stats.total_analyzed > 0
    ? Math.round(((stats.credible_count + stats.fake_count) / stats.total_analyzed) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-700 text-2xl text-white flex items-center gap-2">
          <BarChart3 size={22} style={{ color: '#00D4FF' }} />
          Analytics Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#718096' }}>
          Real-time insights from {stats.total_analyzed} analyzed articles
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Analyzed" value={stats.total_analyzed}
          icon={<BarChart3 size={18} />} color="#00D4FF" />
        <StatCard label="Fake Detected" value={stats.fake_count + stats.suspicious_count}
          sub="fake + suspicious"
          icon={<XCircle size={18} />} color="#FF4B6E" />
        <StatCard label="Credible Found" value={stats.credible_count}
          icon={<CheckCircle size={18} />} color="#00C851" />
        <StatCard label="Avg Fake Score" value={`${stats.avg_fake_score}%`}
          sub={`${stats.avg_confidence}% avg confidence`}
          icon={<AlertTriangle size={18} />} color="#FFB800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Verdict Distribution Pie */}
        <div className="rounded-2xl p-6" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
          <h3 className="font-display font-600 text-sm mb-4 uppercase tracking-widest" style={{ color: '#718096' }}>
            Verdict Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={3} stroke="none">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span style={{ color: '#718096' }}>{d.name}</span>
                <span className="font-medium" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Frequency */}
        <div className="rounded-2xl p-6" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
          <h3 className="font-display font-600 text-sm mb-4 uppercase tracking-widest" style={{ color: '#718096' }}>
            Signal Frequency
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={signalData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2340" />
              <XAxis dataKey="name" tick={{ fill: '#4A5568', fontSize: 10 }} />
              <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#00D4FF" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fake Score Trend */}
      {trendData.length > 1 && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
          <h3 className="font-display font-600 text-sm mb-4 uppercase tracking-widest" style={{ color: '#718096' }}>
            Credibility Trend — Recent Articles
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2340" />
              <XAxis dataKey="index" tick={{ fill: '#4A5568', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#4A5568', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#718096', fontSize: 12 }} />
              <Line type="monotone" dataKey="fake" name="Fake Score %"
                stroke="#FF4B6E" strokeWidth={2} dot={{ fill: '#FF4B6E', r: 4 }} />
              <Line type="monotone" dataKey="real" name="Credibility %"
                stroke="#00C851" strokeWidth={2} dot={{ fill: '#00C851', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* NLP Pipeline Info */}
      <div className="rounded-2xl p-6" style={{ background: '#1A1F2E', border: '1px solid #1A2340' }}>
        <h3 className="font-display font-600 text-sm mb-5 uppercase tracking-widest" style={{ color: '#718096' }}>
          NLP Pipeline Architecture
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { step: '01', label: 'Text Input', desc: 'Title + Content', color: '#00D4FF' },
            { step: '02', label: 'Preprocessing', desc: 'Tokenize · Lemmatize · Stopwords', color: '#A78BFA' },
            { step: '03', label: 'TF-IDF', desc: '5K features · N-grams (1–3)', color: '#FFB800' },
            { step: '04', label: 'Classification', desc: 'Logistic Regression', color: '#FF4B6E' },
            { step: '05', label: 'Confidence', desc: 'Probability scores', color: '#00C851' },
          ].map(({ step, label, desc, color }) => (
            <div key={step} className="rounded-xl p-4 text-center" style={{ background: '#141B2D' }}>
              <div className="font-display font-700 text-xs mb-2" style={{ color }}>STEP {step}</div>
              <div className="font-medium text-sm text-white mb-1">{label}</div>
              <div className="text-xs" style={{ color: '#4A5568' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
