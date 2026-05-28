'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getPaper, downloadPDF, regenerateSection } from '@/lib/api';
import { GeneratedPaper, PaperSection, Question } from '@/types';

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function DifficultyTag({ difficulty }: { difficulty: Question['difficulty'] }) {
  return <span className="font-normal text-gray-500">[{difficulty}]</span>;
}

function SectionBlock({
  section,
  sIdx,
  assignmentId,
  onRegenerate,
}: {
  section: PaperSection;
  sIdx: number;
  assignmentId: string;
  onRegenerate: (sIdx: number, newSection: PaperSection) => void;
}) {
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const { section: newSection } = await regenerateSection(assignmentId, sIdx, section.type);
      onRegenerate(sIdx, newSection);
      toast.success('Section regenerated');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="relative">
      {/* Regenerate button */}
      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="absolute top-0 right-0 flex items-center gap-1.5 text-[11px] text-[#757575] hover:text-[#1A1A1A] px-2.5 py-1 rounded-lg hover:bg-gray-100 border border-[#E8E8E8] transition-colors disabled:opacity-50 bg-white"
      >
        {regenerating ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
        {regenerating ? 'Regenerating...' : 'Regenerate Section'}
      </button>

      <AnimatePresence mode="wait">
        {regenerating ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pt-8">
            <div className="text-center mb-4">
              <div className="h-4 bg-gray-100 rounded w-24 mx-auto mb-1 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-32 mx-auto animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          </motion.div>
        ) : (
          <motion.div key={section.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-[#1A1A1A]">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.questions.map((q: Question) => (
                <div key={q.number} className="text-sm text-[#1A1A1A] dark:text-[#F1F5F9] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">{q.number}.</span>
                    <div className="flex-1">
                      {q.text}
                      {q.options && q.options.length > 0 && (
                        <ol type="a" className="mt-2 ml-4 space-y-1 list-[lower-alpha]">
                          {q.options.map((opt, oi) => <li key={oi} className="text-sm">{opt}</li>)}
                        </ol>
                      )}
                    </div>
                    <span className="flex-shrink-0 font-semibold text-xs text-right">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionPaper({ paper, assignmentId, onSectionUpdate }: {
  paper: GeneratedPaper;
  assignmentId: string;
  onSectionUpdate: (sIdx: number, newSection: PaperSection) => void;
}) {
  return (
    <div className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] max-w-2xl mx-auto font-serif">
      {/* Paper header */}
      <div className="text-center border-b border-[#E0E0E0] dark:border-[#2E3148] px-10 py-8">
        <h1 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F1F5F9] mb-1">{paper.schoolName}</h1>
        <div className="text-sm text-[#757575] mt-1 space-y-0.5">
          <p><span className="font-medium">Subject:</span> {paper.subject}</p>
          <p><span className="font-medium">Class:</span> {paper.className}</p>
        </div>
        <div className="flex justify-between mt-3 text-sm text-[#1A1A1A]">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.metadata.totalMarks}</span>
        </div>
        <p className="text-xs text-[#757575] dark:text-[#94A3B8] italic mt-2">All questions are compulsory unless stated otherwise.</p>
        <div className="mt-4 text-left space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#1A1A1A]">Name:</span>
            <span className="flex-1 border-b border-[#1A1A1A]" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-[#1A1A1A]">Roll Number:</span>
            <span className="flex-1 border-b border-[#1A1A1A]" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-[#1A1A1A]">Class:</span>
            <span>{paper.className}</span>
            <span className="font-medium text-[#1A1A1A] ml-4">Section:</span>
            <span className="flex-1 border-b border-[#1A1A1A]" />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-10 py-6 space-y-10">
        {paper.sections.map((section: PaperSection, sIdx: number) => (
          <SectionBlock
            key={sIdx}
            section={section}
            sIdx={sIdx}
            assignmentId={assignmentId}
            onRegenerate={onSectionUpdate}
          />
        ))}
      </div>

      <div className="border-t border-[#E0E0E0] dark:border-[#2E3148] px-10 py-4 text-center">
        <p className="text-sm italic text-[#757575] dark:text-[#94A3B8]">— End of Question Paper —</p>
      </div>

      <div className="border-t border-[#E0E0E0] dark:border-[#2E3148] px-10 py-6">
        <h2 className="text-base font-bold text-[#1A1A1A] text-center mb-4">Answer Key</h2>
        <div className="space-y-3">
          {paper.answerKey.map((a) => (
            <div key={a.number} className="text-sm text-[#1A1A1A] dark:text-[#F1F5F9] leading-relaxed">
              <span className="font-bold">{a.number}.</span> {a.answer}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { paper: storedPaper, setPaper, setJobStatus } = useAssignmentStore();
  const [paper, setPaperLocal] = useState<GeneratedPaper | null>(storedPaper);
  const [loading, setLoading] = useState(!storedPaper);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (storedPaper) { setPaperLocal(storedPaper); return; }
    getPaper(id)
      .then((p) => { setPaperLocal(p); setPaper(p); })
      .catch(() => setError('Could not load the paper. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  function handleSectionUpdate(sIdx: number, newSection: PaperSection) {
    setPaperLocal((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, sections: [...prev.sections] };
      updated.sections[sIdx] = newSection;
      return updated;
    });
  }

  async function handleDownload() {
    if (!paper) return;
    setDownloading(true);
    try {
      const blob = await downloadPDF(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.subject.replace(/\s+/g, '_')}_question_paper.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#1A1A1A] mx-auto mb-4" />
          <p className="text-sm text-[#757575] dark:text-[#94A3B8]">Loading your question paper...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-base font-semibold text-[#1A1A1A] mb-2">Something went wrong</p>
          <p className="text-sm text-[#757575] mb-6">{error}</p>
          <button onClick={() => router.push('/assignments')}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors">
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  return (
    <div className="min-h-screen">
      {/* AI Banner */}
      <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-sm leading-relaxed flex-1">
          <span className="font-semibold">Your question paper is ready!</span>{' '}
          <span className="text-gray-300">{paper.subject}</span> — {paper.metadata.totalQuestions} questions, {paper.metadata.totalMarks} marks
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => { setJobStatus('idle'); router.push('/create'); }}
            className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-colors">
            <RotateCcw size={14} />
            New Paper
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 border border-white text-white text-sm font-medium rounded-full hover:bg-white hover:text-[#1A1A1A] transition-colors disabled:opacity-60">
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <QuestionPaper paper={paper} assignmentId={id} onSectionUpdate={handleSectionUpdate} />
        </motion.div>
      </div>
    </div>
  );
}
