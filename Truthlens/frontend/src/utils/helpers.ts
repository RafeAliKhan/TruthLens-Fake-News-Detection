import type { Verdict } from '../types';

export const verdictConfig = {
  FAKE: {
    color: '#FF4B6E',
    bg: 'rgba(255,75,110,0.12)',
    border: 'rgba(255,75,110,0.3)',
    label: 'Fake News',
    icon: '✕',
    desc: 'High likelihood of misinformation',
  },
  SUSPICIOUS: {
    color: '#FFB800',
    bg: 'rgba(255,184,0,0.12)',
    border: 'rgba(255,184,0,0.3)',
    label: 'Suspicious',
    icon: '⚠',
    desc: 'Contains misleading indicators',
  },
  UNCERTAIN: {
    color: '#A0AEC0',
    bg: 'rgba(160,174,192,0.12)',
    border: 'rgba(160,174,192,0.3)',
    label: 'Uncertain',
    icon: '?',
    desc: 'Insufficient signals detected',
  },
  CREDIBLE: {
    color: '#00C851',
    bg: 'rgba(0,200,81,0.12)',
    border: 'rgba(0,200,81,0.3)',
    label: 'Credible',
    icon: '✓',
    desc: 'Appears to be reliable content',
  },
} satisfies Record<Verdict, object>;

export const getVerdictConfig = (verdict: Verdict) => verdictConfig[verdict] ?? verdictConfig.UNCERTAIN;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '…' : str;
