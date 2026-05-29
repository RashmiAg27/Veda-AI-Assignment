'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ArrowLeft, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { generateId } from '@/lib/uuid';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { createAssignment } from '@/lib/api';
import { QuestionTypeRow } from '@/types';

const KNOWN_SUBJECTS = [
  // Languages
  'english', 'english language', 'english literature', 'english language and literature',
  'hindi', 'hindi course a', 'hindi course b', 'sanskrit', 'french', 'german', 'spanish',
  'urdu', 'punjabi', 'bengali', 'tamil', 'telugu', 'kannada', 'malayalam', 'marathi', 'gujarati',
  // Mathematics
  'mathematics', 'maths', 'math', 'mathematics standard', 'mathematics basic', 'applied mathematics', 'statistics',
  // Sciences
  'science', 'physics', 'chemistry', 'biology', 'biotechnology', 'environmental science', 'evs',
  'environmental studies', 'general science',
  // Social Sciences
  'social science', 'social studies', 'sst', 'history', 'geography', 'political science', 'civics',
  'economics', 'sociology', 'philosophy', 'psychology',
  // Commerce
  'accountancy', 'accounts', 'business studies', 'business economics',
  // Computer & Technology
  'computer science', 'computers', 'information technology', 'it', 'informatics practices',
  'artificial intelligence', 'ai', 'data science',
  // Physical & Arts
  'physical education', 'pe', 'sports', 'yoga', 'health and physical education',
  'art', 'drawing', 'fine arts', 'painting', 'music', 'hindustani music', 'carnatic music',
  'dance', 'theatre', 'art and craft',
  // Other CBSE subjects
  'home science', 'legal studies', 'entrepreneurship', 'mass media studies',
  'general knowledge', 'gk', 'moral science', 'value education', 'life skills',
];

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}

function isValidSubject(value: string): boolean {
  const input = value.trim().toLowerCase();
  if (!input) return false;
  for (const subject of KNOWN_SUBJECTS) {
    if (input === subject) return true;
    if (subject.includes(input) || input.includes(subject)) return true;
    const threshold = input.length <= 5 ? 1 : input.length <= 8 ? 2 : 3;
    if (levenshtein(input, subject) <= threshold) return true;
  }
  return false;
}

const QUESTION_TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Long Questions' },
  { value: 'diagram', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  { value: 'truefalse', label: 'True/False' },
];

const STEPS = [
  'Analyzing your inputs...',
  'Structuring question sections...',
  'Generating easy questions...',
  'Generating remaining sections...',
  'Building answer key...',
  'Finalizing paper...',
];

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden h-9">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-full flex items-center justify-center text-[#757575] hover:bg-[#F5F5F5] transition-colors text-lg leading-none">−</button>
      <span className="w-8 text-center text-[13px] font-medium text-[#1A1A1A] border-l border-r border-[#E0E0E0]">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-8 h-full flex items-center justify-center text-[#757575] hover:bg-[#F5F5F5] transition-colors text-lg leading-none">+</button>
    </div>
  );
}

function QuestionRow({ row, onUpdate, onRemove }: {
  row: QuestionTypeRow;
  onUpdate: (id: string, field: keyof QuestionTypeRow, value: string | number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
      className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-2">
      <div className="relative">
        <select value={row.type}
          onChange={(e) => {
            const opt = QUESTION_TYPE_OPTIONS.find((o) => o.value === e.target.value);
            onUpdate(row.id, 'type', e.target.value);
            if (opt) onUpdate(row.id, 'label', opt.label);
          }}
          className="w-full appearance-none border border-[#E0E0E0] rounded-lg px-3 py-2 pr-8 text-[13px] text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1A1A1A] cursor-pointer h-9">
          {QUESTION_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E9E9E]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <button type="button" onClick={() => onRemove(row.id)}
        className="w-7 h-7 flex items-center justify-center text-[#9E9E9E] hover:text-[#D32F2F] hover:bg-red-50 rounded-md transition-colors text-base">×</button>
      <Stepper value={row.count} onChange={(v) => onUpdate(row.id, 'count', v)} />
      <Stepper value={row.marksPerQuestion} onChange={(v) => onUpdate(row.id, 'marksPerQuestion', v)} />
    </motion.div>
  );
}

function GeneratingOverlay({ currentStep, statusMessage }: { currentStep: number; statusMessage: string }) {
  const progress = Math.min(100, (currentStep / 6) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="py-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.6H22l-6.4 4.8 2.4 7.6L12 17.2l-6 4.8 2.4-7.6L2 9.6h7.6z" fill="#1A1A1A"/>
          </svg>
        </div>
        <h2 className="text-[17px] font-bold text-[#1A1A1A]">Generating Your Question Paper</h2>
        <p className="text-[13px] text-[#9E9E9E] mt-1">AI is crafting a personalised paper for your class</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full mb-8 overflow-hidden">
        <motion.div className="h-full bg-[#1A1A1A] rounded-full"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const state = stepNum < currentStep ? 'done' : stepNum === currentStep ? 'active' : 'pending';
          return (
            <motion.div key={i} layout
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                state === 'active' ? 'bg-[#F5F5F5] border border-[#E0E0E0]' : ''
              }`}>
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {state === 'done' && (
                    <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 size={20} className="text-green-500" />
                    </motion.div>
                  )}
                  {state === 'active' && (
                    <motion.div key="active" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Loader2 size={20} className="text-[#1A1A1A] animate-spin" />
                    </motion.div>
                  )}
                  {state === 'pending' && (
                    <motion.div key="pending" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Circle size={20} className="text-[#D0D0D0]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={`text-[13px] ${
                state === 'done' ? 'text-[#757575] line-through' :
                state === 'active' ? 'text-[#1A1A1A] font-semibold' :
                'text-[#BDBDBD]'
              }`}>{label}</span>
              {state === 'active' && (
                <span className="ml-auto text-[11px] font-medium text-[#1A1A1A] bg-white border border-[#E0E0E0] px-2 py-0.5 rounded-full">
                  In progress
                </span>
              )}
              {state === 'done' && (
                <span className="ml-auto text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[12px] text-[#9E9E9E] mt-6">
        {statusMessage || 'Please wait while we create your paper...'}
      </p>
    </motion.div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const {
    formData, setFormData,
    addQuestionType, removeQuestionType, updateQuestionType,
    assignmentId, setAssignmentId, setJobStatus, jobStatus, statusMessage, currentStep,
  } = useAssignmentStore();

  useWebSocket(assignmentId);

  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGenerating = jobStatus === 'pending' || jobStatus === 'processing';

  useEffect(() => {
    if (jobStatus === 'completed' || jobStatus === 'failed') setJobStatus('idle');
  }, []); // eslint-disable-line

  const totalQuestions = formData.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = formData.questionTypes.reduce((s, q) => s + q.count * q.marksPerQuestion, 0);

  const handleFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { setErrors(e => ({ ...e, file: 'Max 10MB' })); return; }
    setFormData({ file });
  }, [setFormData]);

  function addRow() {
    addQuestionType({ id: generateId(), type: 'mcq', label: 'Multiple Choice Questions', count: 4, marksPerQuestion: 1 });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    else if (!isValidSubject(formData.subject)) errs.subject = 'Invalid subject name. Please enter a recognized school subject';
    if (!formData.className.trim()) errs.className = 'Grade is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    else if (new Date(formData.dueDate) <= new Date()) errs.dueDate = 'Must be a future date';
    if (formData.questionTypes.length === 0) errs.questionTypes = 'Add at least one question type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const fd = new FormData();
    fd.append('subject', formData.subject);
    fd.append('className', formData.className);
    fd.append('instructions', formData.instructions);
    fd.append('dueDate', formData.dueDate);

    fd.append('questionTypes', JSON.stringify(
      formData.questionTypes.map(({ type, label, count, marksPerQuestion }) => ({ type, label, count, marksPerQuestion }))
    ));
    if (formData.file) fd.append('file', formData.file);
    setJobStatus('pending');
    try {
      const { assignmentId: id } = await createAssignment(fd);
      setAssignmentId(id);
    } catch (err) {
      setJobStatus('failed');
      setErrors({ submit: (err as Error).message });
    }
  }

  const progressBarWidth = isGenerating
    ? `${Math.min(100, ((currentStep || 0) / 6) * 100 + 5)}%`
    : '33%';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-1 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full transition-colors ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
        <h1 className="text-[20px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Create Assignment</h1>
      </div>
      <p className="text-[13px] text-[#9E9E9E] dark:text-[#94A3B8] mb-4 ml-4">
        {isGenerating ? 'AI is working on your paper...' : 'Set up a new assignment for your students'}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#E0E0E0] rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-[#1565C0] rounded-full"
          animate={{ width: progressBarWidth }} transition={{ duration: 0.5 }} />
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-6 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] min-h-[400px]">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <GeneratingOverlay key="generating" currentStep={currentStep} statusMessage={statusMessage} />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h2 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Assignment Details</h2>
                <p className="text-[12px] text-[#9E9E9E] dark:text-[#64748B] mt-0.5">Basic information about your assignment</p>
              </div>

              {/* Subject + Grade */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Subject <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Science, Mathematics"
                    value={formData.subject}
                    onChange={(e) => { setFormData({ subject: e.target.value }); setErrors(er => ({ ...er, subject: '' })); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#BDBDBD] dark:placeholder:text-[#64748B] ${errors.subject ? 'border-red-400' : 'border-[#E0E0E0] dark:border-[#2E3148]'}`}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Grade <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={formData.className}
                      onChange={(e) => { setFormData({ className: e.target.value }); setErrors(er => ({ ...er, className: '' })); }}
                      className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors pr-8 ${errors.className ? 'border-red-400' : 'border-[#E0E0E0] dark:border-[#2E3148]'} ${!formData.className ? 'text-[#BDBDBD] dark:text-[#64748B]' : ''}`}
                    >
                      <option value="" disabled>Select grade</option>
                      {['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E9E9E]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-5">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#1A1A1A] bg-gray-50' : 'border-[#E0E0E0] hover:border-[#BDBDBD]'}`}>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,.pdf" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  <Upload size={26} className="mx-auto text-[#9E9E9E] mb-3" />
                  <p className="text-[13px] font-medium text-[#1A1A1A]">Choose a file or drag & drop it here</p>
                  <p className="text-[11px] text-[#9E9E9E] mt-1">JPEG, PNG, up to 10MB</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="mt-3 px-4 py-1.5 border border-[#E0E0E0] rounded-lg text-[12px] font-medium text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                    Browse Files
                  </button>
                </div>
                {formData.file && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-[#E0E0E0] rounded-lg">
                    <span className="text-xs text-[#1A1A1A] flex-1 truncate">{formData.file.name}</span>
                    <button type="button" onClick={() => setFormData({ file: undefined })} className="text-[#9E9E9E] hover:text-red-500"><X size={13} /></button>
                  </div>
                )}
                <p className="text-[11px] text-[#9E9E9E] mt-1.5">Upload images of your preferred document/image</p>
              </div>

              {/* Due Date */}
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Due Date</label>
                <div className="relative">
                  <input type="date" value={formData.dueDate}
                    onChange={(e) => { setFormData({ dueDate: e.target.value }); setErrors(er => ({ ...er, dueDate: '' })); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors pr-10 ${errors.dueDate ? 'border-red-400' : 'border-[#E0E0E0] dark:border-[#2E3148]'}`}
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>

              {/* Question Types */}
              <div className="mb-5">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mb-1">
                  <span className="text-[12px] font-semibold text-[#1A1A1A]">Question Type</span>
                  <span />
                  <span className="text-[12px] font-semibold text-[#1A1A1A] text-center w-24">No. of Questions</span>
                  <span className="text-[12px] font-semibold text-[#1A1A1A] text-center w-24">Marks</span>
                </div>
                <AnimatePresence mode="popLayout">
                  {formData.questionTypes.map((row) => (
                    <QuestionRow key={row.id} row={row} onUpdate={updateQuestionType} onRemove={removeQuestionType} />
                  ))}
                </AnimatePresence>
                {errors.questionTypes && <p className="text-xs text-red-500 mt-1">{errors.questionTypes}</p>}
                <button type="button" onClick={addRow}
                  className="flex items-center gap-2 mt-3 text-[13px] font-medium text-[#1A1A1A] hover:opacity-70 transition-opacity">
                  <span className="w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white text-base leading-none">+</span>
                  Add Question Type
                </button>
                {formData.questionTypes.length > 0 && (
                  <div className="mt-4 text-right space-y-1">
                    <p className="text-[13px] text-[#1A1A1A] dark:text-[#E2E8F0]">Total Questions : <span className="font-bold">{totalQuestions}</span></p>
                    <p className="text-[13px] text-[#1A1A1A] dark:text-[#E2E8F0]">Total Marks : <span className="font-bold">{totalMarks}</span></p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="mb-8">
                <label className="block text-[13px] font-semibold text-[#1A1A1A] mb-1.5">
                  Additional Information <span className="font-normal text-[#9E9E9E]">(For better output)</span>
                </label>
                <div className="relative">
                  <textarea rows={4} placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ instructions: e.target.value })}
                    className="w-full border border-[#E0E0E0] dark:border-[#2E3148] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#BDBDBD] dark:placeholder:text-[#64748B] resize-none"
                  />
                  <svg className="absolute bottom-3 right-3 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.6H22l-6.4 4.8 2.4 7.6L12 17.2l-6 4.8 2.4-7.6L2 9.6h7.6z" fill="#93C5FD"/>
                  </svg>
                </div>
              </div>

              {errors.submit && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">{errors.submit}</div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => router.push('/assignments')}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#E0E0E0] dark:border-[#2E3148] rounded-xl text-[13px] font-medium text-[#1A1A1A] dark:text-[#F1F5F9] hover:bg-gray-50 dark:hover:bg-[#2E3148] transition-colors">
                  <ArrowLeft size={14} />
                  Previous
                </button>
                <button type="button" onClick={handleSubmit}
                  className="px-6 py-2.5 bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-[13px] font-semibold rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors">
                  Generate Paper →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
