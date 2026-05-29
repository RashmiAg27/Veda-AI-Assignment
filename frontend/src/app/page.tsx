'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Clock, CalendarDays } from 'lucide-react';
import { getStats } from '@/lib/api';
import { Stats, Assignment, UpcomingAssignment } from '@/types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-5 flex-1 min-w-0 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)]">
      <p className="text-[32px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9] leading-none">{value}</p>
      <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#94A3B8] mt-2">{label}</p>
      {sub && <p className="text-[11px] text-[#9E9E9E] dark:text-[#64748B] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function ActivityItem({ a }: { a: Assignment }) {
  const icons = {
    completed: <CheckCircle2 size={16} className="text-green-500" />,
    processing: <Loader2 size={16} className="text-blue-500 animate-spin" />,
    pending: <Clock size={16} className="text-yellow-500" />,
    failed: <XCircle size={16} className="text-red-500" />,
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] dark:border-[#2E3148] last:border-0">
      <div className="flex-shrink-0">{icons[a.status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F1F5F9] truncate">{a.title}</p>
        <p className="text-[11px] text-[#9E9E9E] dark:text-[#64748B]">{timeAgo(a.createdAt)}</p>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
        a.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-[#064E3B] dark:text-[#34D399]' :
        a.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-[#1E3A5F] dark:text-[#60A5FA]' :
        a.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
        'bg-red-100 text-red-700 dark:bg-[#450A0A] dark:text-[#F87171]'
      }`}>
        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
      </span>
    </div>
  );
}

function dueDateLabel(dateStr: string): { label: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { label: 'Today', color: '#EF4444' };
  if (diff === 1) return { label: 'Tomorrow', color: '#EF4444' };
  if (diff <= 3) return { label: `In ${diff} days`, color: '#F59E0B' };
  return { label: `In ${diff} days`, color: '#6B7280' };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-5 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-[#2E3148] rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-[#2E3148] rounded w-28" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard label="Total Assignments" value={stats.totalAssignments} sub="All time" />
            <StatCard label="Generated Today" value={stats.generatedToday} sub="Since midnight" />
            <StatCard label="Questions Created" value={stats.totalQuestions} sub="Across all papers" />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-5 shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Recent Activity</h2>
            <Link href="/assignments" className="text-[12px] text-[#757575] dark:text-[#94A3B8] hover:text-[#1A1A1A] dark:hover:text-[#F1F5F9] transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 dark:bg-[#363636] rounded-xl animate-pulse" />)}</div>
          ) : stats?.recentAssignments?.length ? (
            stats.recentAssignments.map((a) => <ActivityItem key={a._id} a={a} />)
          ) : (
            <div className="py-10 text-center">
              <p className="text-[13px] text-[#9E9E9E] dark:text-[#64748B] mb-3">No assignments yet</p>
              <Link href="/create" className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F1F5F9] underline">Create your first →</Link>
            </div>
          )}
        </div>

        {/* Due This Week */}
        <div className="bg-white dark:bg-[#363636] border border-[#E0E0E0] dark:border-[#2E3148] rounded-2xl p-5 h-fit shadow-[3px_3px_10px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_10px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-[#1A1A1A] dark:text-[#F1F5F9]" />
            <h2 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#F1F5F9]">Due This Week</h2>
          </div>
          <p className="text-[12px] text-[#9E9E9E] dark:text-[#64748B] mb-4">Completed papers due in the next 7 days</p>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-50 dark:bg-[#363636] rounded-lg animate-pulse" />)}
            </div>
          ) : stats?.upcomingDue?.length ? (
            <div className="space-y-1">
              {stats.upcomingDue.map((a: UpcomingAssignment) => {
                const { label, color } = dueDateLabel(a.dueDate);
                return (
                  <Link
                    key={a._id}
                    href={`/output/${a._id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#252840] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F1F5F9] truncate">{a.title}</p>
                      <p className="text-[11px] text-[#9E9E9E] dark:text-[#64748B]">{a.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
                      <span className="text-[#BDBDBD] dark:text-[#64748B] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F1F5F9] transition-colors">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[22px] mb-2">📭</p>
              <p className="text-[12px] text-[#9E9E9E] dark:text-[#64748B]">No assignments due this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
