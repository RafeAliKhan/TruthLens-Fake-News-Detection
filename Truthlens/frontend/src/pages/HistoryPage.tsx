import React, { useEffect, useState } from 'react';
import { Clock, Trash2, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { getHistory, clearHistory } from '../utils/api';
import { VerdictCard } from '../components/VerdictCard';
import type { AnalysisResult } from '../types';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const LIMIT = 10;

  const load = async (skip: number) => {
    setLoading(true);
    try {
      const res = await getHistory(LIMIT, skip);
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page * LIMIT); }, [page]);

  const handleClear = async () => {
    if (!confirm('Clear all analysis history?')) return;
    await clearHistory();
    setItems([]);
    setTotal(0);
    setSelected(null);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-700 text-2xl text-white flex items-center gap-2">
            <Clock size={22} style={{ color: '#00D4FF' }} />
            Analysis History
          </h1>
          <p className="text-sm mt-1" style={{ color: '#718096' }}>
            {total} articles analyzed
          </p>
        </div>
        {total > 0 && (
          <button onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(255,75,110,0.1)', color: '#FF4B6E', border: '1px solid rgba(255,75,110,0.2)' }}>
            <Trash2 size={14} />Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={28} className="animate-spin" style={{ color: '#00D4FF' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={48} className="mx-auto mb-4" style={{ color: '#1A2340' }} />
          <p style={{ color: '#4A5568' }}>No analyses yet. Start by analyzing an article.</p>
        </div>
      ) : (
        <>
          {selected ? (
            <div>
              <button onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-all"
                style={{ color: '#00D4FF' }}>
                <ChevronLeft size={16} /> Back to list
              </button>
              <VerdictCard result={selected} />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} onClick={() => setSelected(item)}>
                    <VerdictCard result={item} compact />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                    className="p-2 rounded-lg transition-all disabled:opacity-30"
                    style={{ background: '#1A1F2E', color: '#00D4FF' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm" style={{ color: '#718096' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg transition-all disabled:opacity-30"
                    style={{ background: '#1A1F2E', color: '#00D4FF' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
