'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getGroups, createGroup, deleteGroup } from '@/lib/api';
import { Group } from '@/types';
import { generateId } from '@/lib/uuid';

const GRADE_OPTIONS = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];

function GroupCard({ group, onDelete, onAssign }: {
  group: Group;
  onDelete: (id: string) => void;
  onAssign: (group: Group) => void;
}) {
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
    'bg-green-100 text-green-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700'];
  const color = colors[group.name.charCodeAt(0) % colors.length];

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-5 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-shadow relative group">
      <button onClick={() => onDelete(group._id)}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-[#BDBDBD] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 size={14} />
      </button>

      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center font-bold text-base mb-3`}>
        {group.name.charAt(0).toUpperCase()}
      </div>

      <h3 className="font-bold text-[#1A1A1A] dark:text-[#F1F5F9] text-[14px] leading-tight">{group.name}</h3>
      <p className="text-[12px] text-[#757575] dark:text-[#94A3B8] mt-0.5">Grade {group.grade}</p>

      <div className="flex items-center gap-1.5 mt-3 text-[12px] text-[#757575] dark:text-[#94A3B8]">
        <Users size={12} />
        <span>{group.studentCount} students</span>
      </div>
      <p className="text-[12px] text-[#9E9E9E] dark:text-[#64748B] mt-0.5">{group.subject}</p>

      <button onClick={() => onAssign(group)}
        className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-[12px] font-semibold rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors">
        Assign →
      </button>
    </motion.div>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (g: Group) => void }) {
  const [form, setForm] = useState({ name: '', grade: '8th', subject: '', studentCount: 30 });
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function click(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, [onClose]);

  async function handleSave() {
    if (!form.name.trim() || !form.subject.trim()) { toast.error('Name and subject are required'); return; }
    setSaving(true);
    try {
      const group = await createGroup(form);
      onCreate(group);
      toast.success('Group created');
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div ref={ref} initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white dark:bg-[#1E2130] rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Create Group</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#757575]"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Group Name</label>
            <input type="text" placeholder="e.g. Class 8A"
              value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] placeholder:text-[#BDBDBD] dark:placeholder:text-[#64748B]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Grade</label>
              <select value={form.grade} onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))}
                className="w-full border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#3B82F6] bg-white dark:bg-[#363636] dark:text-[#F1F5F9]">
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Students</label>
              <input type="number" min={1} value={form.studentCount}
                onChange={(e) => setForm(f => ({ ...f, studentCount: parseInt(e.target.value) || 1 }))}
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#1A1A1A] dark:text-[#E2E8F0] mb-1.5">Subject</label>
            <input type="text" placeholder="e.g. Science, Mathematics"
              value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full border border-[#E0E0E0] dark:border-[#2E3148] rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-[#363636] dark:text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] placeholder:text-[#BDBDBD] dark:placeholder:text-[#64748B]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-[#E0E0E0] text-[#1A1A1A] text-[13px] font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-[#1A1A1A] dark:bg-[#FFF3E8] dark:border dark:border-[#E8650A]/40 text-white dark:text-[#1A0A00] text-[13px] font-semibold rounded-xl hover:bg-[#333] dark:hover:bg-[#FFE8CC] transition-colors disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const { reset, setFormData, addQuestionType } = useAssignmentStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getGroups().then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteGroup(id);
      setGroups(g => g.filter(x => x._id !== id));
      toast.success('Group deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  function handleAssign(group: Group) {
    reset();
    setFormData({ subject: group.subject, className: group.grade });
    addQuestionType({ id: generateId(), type: 'mcq', label: 'Multiple Choice Questions', count: 5, marksPerQuestion: 2 });
    router.push('/create');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">My Groups</h1>
          <p className="text-sm text-[#757575] dark:text-[#94A3B8] mt-1">Manage your class groups and assign papers</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[13px] font-semibold px-4 py-2.5 rounded-full hover:bg-[#333] transition-colors">
          <Plus size={14} />
          Create Group
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white border border-[#E0E0E0] rounded-2xl p-5 h-48 animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-[#9E9E9E]" />
          </div>
          <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-2">No groups yet</h2>
          <p className="text-[13px] text-[#9E9E9E] max-w-xs mb-6">Create your first class group to quickly assign papers to specific grades.</p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors">
            <Plus size={14} />
            Create Your First Group
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map(g => <GroupCard key={g._id} group={g} onDelete={handleDelete} onAssign={handleAssign} />)}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showModal && (
          <CreateModal
            onClose={() => setShowModal(false)}
            onCreate={(g) => setGroups(prev => [g, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
