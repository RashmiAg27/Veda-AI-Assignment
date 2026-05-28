'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, Eye, Trash2, FileX, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignments, deleteAssignment } from '@/lib/api';
import { Assignment } from '@/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function StatusBadge({ status }: { status: Assignment['status'] }) {
  const colors: Record<Assignment['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AssignmentCard({
  assignment,
  onDelete,
}: {
  assignment: Assignment;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-xl p-5 relative shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-shadow"
    >
      {/* 3-dot menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2E3148] text-[#757575] dark:text-[#94A3B8] transition-colors"
        >
          <MoreVertical size={16} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-9 bg-white dark:bg-[#1E2130] border border-[#E0E0E0] dark:border-[#2E3148] rounded-xl shadow-lg z-10 min-w-[160px] overflow-hidden"
            >
              {assignment.status === 'completed' && (
                <Link
                  href={`/output/${assignment._id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-[#F1F5F9] hover:bg-gray-50 dark:hover:bg-[#252840] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Eye size={15} />
                  View Assignment
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(assignment._id);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pr-8">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F1F5F9] text-sm leading-tight">{assignment.title}</h3>
        </div>

        <StatusBadge status={assignment.status} />

        <div className="mt-3 space-y-1">
          <p className="text-xs text-[#757575] dark:text-[#94A3B8]">
            Assigned on: <span className="text-[#1A1A1A] dark:text-[#E2E8F0] font-medium">{formatDate(assignment.createdAt)}</span>
          </p>
          <p className="text-xs text-[#757575] dark:text-[#94A3B8]">
            Due:{' '}
            <span className="text-[#D32F2F] dark:text-[#FF6B6B] font-medium">{formatDate(assignment.dueDate)}</span>
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-[#757575] dark:text-[#94A3B8]">
          <span>{assignment.totalQuestions} questions</span>
          <span>·</span>
          <span>{assignment.totalMarks} marks</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Illustration matching Figma — document + X + magnifier */}
      <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
        {/* Document */}
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="65" height="82" rx="6" fill="white" stroke="#E0E0E0" strokeWidth="2"/>
          <rect x="16" y="22" width="42" height="4" rx="2" fill="#E0E0E0"/>
          <rect x="16" y="32" width="34" height="4" rx="2" fill="#E0E0E0"/>
          <rect x="16" y="42" width="38" height="4" rx="2" fill="#E0E0E0"/>
          <rect x="16" y="52" width="28" height="4" rx="2" fill="#E0E0E0"/>
          {/* Red X circle */}
          <circle cx="58" cy="68" r="18" fill="#FFEBEE" stroke="#EF9A9A" strokeWidth="1.5"/>
          <line x1="51" y1="61" x2="65" y2="75" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round"/>
          <line x1="65" y1="61" x2="51" y2="75" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        {/* Magnifier */}
        <div className="absolute bottom-0 right-0">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="15" cy="15" r="10" fill="white" stroke="#BDBDBD" strokeWidth="2.5"/>
            <line x1="22" y1="22" x2="32" y2="32" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Sparkle */}
        <div className="absolute top-1 right-4">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 0l1.5 5.5L14 7l-5.5 1.5L7 14l-1.5-5.5L0 7l5.5-1.5z" fill="#90CAF9"/>
          </svg>
        </div>
      </div>

      <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-2">No assignments yet</h2>
      <p className="text-[13px] text-[#9E9E9E] max-w-sm mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link
        href="/create"
        className="flex items-center gap-2 bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-[13px] font-semibold px-6 py-3 rounded-full hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors"
      >
        <Plus size={15} />
        Create Your First Assignment
      </Link>
    </div>
  );
}

export default function AssignmentsPage() {
  const { assignments, setAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignments();
        setAssignments(data);
      } catch {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setAssignments]);

  async function handleDelete(id: string) {
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter((a) => a._id !== id));
    } catch {
      alert('Failed to delete assignment');
    }
  }

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || a.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Assignments</h1>
        <p className="text-sm text-[#757575] dark:text-[#94A3B8] mt-1">
          Manage and create assignments for your classes
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg text-sm text-[#757575] dark:text-[#94A3B8] hover:border-[#BDBDBD] hover:text-[#1A1A1A] dark:hover:text-[#F1F5F9] transition-colors bg-white dark:bg-[#363636]"
          >
            <Filter size={15} />
            {statusFilter === 'All' ? 'Filter By' : statusFilter}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-9 bg-white dark:bg-[#1E2130] border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg shadow-md z-20 min-w-[120px] overflow-hidden">
              {['All', 'Pending', 'Processing', 'Completed', 'Failed'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setStatusFilter(option); setFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    statusFilter === option
                      ? 'bg-[#E8F0FE] text-[#1A1A1A] font-medium'
                      : 'text-[#757575] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg text-sm bg-white dark:bg-[#363636] text-[#1A1A1A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors placeholder:text-[#BDBDBD] dark:placeholder:text-[#64748B]"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#E0E0E0] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-[#757575]">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} onDelete={handleDelete} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Bottom CTA */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/create"
            className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-black transition-colors"
          >
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>
      )}
    </div>
  );
}
