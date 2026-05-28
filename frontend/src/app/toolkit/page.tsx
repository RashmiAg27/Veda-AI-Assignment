'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookMarked, Users, Loader2, Send, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const resultAnim = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3 },
};

// ─── Card 1: Paper Reviewer ───────────────────────────────────────────────────

function CircleScore({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle cx="56" cy="56" r={r} fill="none" stroke="#3B82F6" strokeWidth="8"
            strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 56 56)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#1A1A1A] leading-none">{score}</span>
          <span className="text-sm text-gray-400">/10</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-600 mt-2">Overall Score</p>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span><span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function PaperReviewer() {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  function handleReview() {
    setShowResult(false);
    setLoading(true);
    setTimeout(() => { setLoading(false); setShowResult(true); }, 1500);
  }

  return (
    <div className="bg-white dark:bg-[#363636] border border-gray-200 dark:border-[#2E3148] rounded-2xl p-6 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
          <Search size={18} color="#3B82F6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#1A1A1A] dark:text-[#F1F5F9]">Paper Reviewer</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8]">Upload any paper and get AI feedback</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <textarea rows={3} placeholder="Paste your question paper text here..."
          className="w-full border border-gray-200 dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#1E2130] dark:text-[#F1F5F9] resize-none focus:outline-none focus:border-[#3B82F6] placeholder:text-gray-300 dark:placeholder:text-[#64748B]" />
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Subject"
            className="border border-gray-200 dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#1E2130] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] placeholder:text-gray-300 dark:placeholder:text-[#64748B]" />
          <input type="text" placeholder="Grade / Class"
            className="border border-gray-200 dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[#1E2130] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] placeholder:text-gray-300 dark:placeholder:text-[#64748B]" />
        </div>
        <button onClick={handleReview}
          className="w-full bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Reviewing...</> : 'Review Paper'}
        </button>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div {...resultAnim} className="overflow-hidden mt-5 pt-5 border-t border-gray-100">
            <CircleScore score={8.2} />
            <MetricBar label="Difficulty Balance" value={75} color="#3B82F6" />
            <MetricBar label="Syllabus Coverage" value={60} color="#10B981" />
            <MetricBar label="Question Clarity" value={90} color="#8B5CF6" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Card 2: Syllabus Coverage ────────────────────────────────────────────────

const chapters = [
  { id: 1, title: 'Chapter 1: Crop Production and Management', status: 'tested' },
  { id: 2, title: 'Chapter 2: Microorganisms: Friend and Foe', status: 'tested' },
  { id: 3, title: 'Chapter 3: Coal and Petroleum', status: 'not-tested' },
  { id: 4, title: 'Chapter 4: Combustion and Flame', status: 'partial' },
  { id: 5, title: 'Chapter 5: Conservation of Plants', status: 'tested' },
  { id: 6, title: 'Chapter 6: Reproduction in Animals', status: 'not-tested' },
];

const statusConfig: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  'tested':     { icon: '✅', label: 'Tested',     bg: '#F0FDF4', text: '#15803D' },
  'not-tested': { icon: '❌', label: 'Not Tested', bg: '#FEF2F2', text: '#DC2626' },
  'partial':    { icon: '⚠️', label: 'Partial',    bg: '#FFFBEB', text: '#D97706' },
};

function SyllabusCoverage() {
  const [subject, setSubject] = useState('Science');
  const [grade, setGrade] = useState('8th');

  return (
    <div className="bg-white dark:bg-[#363636] border border-gray-200 dark:border-[#2E3148] rounded-2xl p-6 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
          <BookMarked size={18} color="#10B981" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#1A1A1A] dark:text-[#F1F5F9]">Syllabus Coverage</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8]">Track which NCERT chapters have been tested</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <select value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full border border-gray-200 dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B82F6] bg-white dark:bg-[#1E2130] dark:text-[#F1F5F9]">
          {['Science', 'Mathematics', 'English', 'Hindi', 'Social Science'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={grade} onChange={e => setGrade(e.target.value)}
          className="w-full border border-gray-200 dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B82F6] bg-white dark:bg-[#1E2130] dark:text-[#F1F5F9]">
          {['6th', '7th', '8th', '9th', '10th'].map(g => <option key={g}>{g}</option>)}
        </select>
        <button className="w-full bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors">
          Check Coverage
        </button>
      </div>

    </div>
  );
}

// ─── Card 3: Share & Collaborate ─────────────────────────────────────────────

interface Comment { name: string; text: string; time: string }

const initialComments: Record<number, Comment[]> = {
  0: [{ name: 'Priya', text: 'Good question', time: '2m ago' }],
  1: [{ name: 'Rahul', text: 'Maybe make this harder?', time: '5m ago' }],
};

function ShareCollaborate() {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  function handleGenerate() {
    setShowResult(false);
    setLoading(true);
    setTimeout(() => { setLoading(false); setShowResult(true); }, 1500);
  }

  function handleCopy() {
    if (linkRef.current) navigator.clipboard.writeText(linkRef.current.value).catch(() => {});
    toast.success('Copied!');
  }


  return (
    <div className="bg-white dark:bg-[#363636] border border-gray-200 dark:border-[#2E3148] rounded-2xl p-6 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FAF5FF' }}>
          <Users size={18} color="#8B5CF6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#1A1A1A] dark:text-[#F1F5F9]">Share & Collaborate</h2>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8]">Share papers with colleagues for live review</p>
        </div>
      </div>

      <div className="mt-5">
        <button onClick={handleGenerate}
          className="w-full bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : 'Generate Share Link'}
        </button>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div {...resultAnim} className="overflow-hidden mt-5 pt-5 border-t border-gray-100">
            <div className="flex gap-2 mb-1">
              <input ref={linkRef} readOnly value="https://vedaai.app/shared/abc123xyz"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 focus:outline-none" />
              <button onClick={handleCopy}
                className="flex-shrink-0 bg-[#1A1A1A] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#333] transition-colors whitespace-nowrap">
                Copy 🔗
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2">Link expires in 7 days</p>
            <p className="text-xs text-green-600 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block flex-shrink-0" />
              Share with colleagues to review together
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToolkitPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">AI Teacher&apos;s Toolkit</h1>
        <p className="text-sm text-[#757575] dark:text-[#94A3B8] mt-1">Smart tools to help you review, plan, and collaborate</p>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2 mb-6 rounded-lg border text-sm"
        style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <Info size={15} color="#F59E0B" className="flex-shrink-0" />
        <span className="text-amber-800">These tools are currently in demo mode. Live AI functionality coming soon.</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <PaperReviewer />
        <SyllabusCoverage />
        <ShareCollaborate />
      </div>
    </div>
  );
}
