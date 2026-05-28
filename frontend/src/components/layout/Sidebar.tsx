'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useThemeStore } from '@/store/themeStore';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    href: '/groups',
    label: 'My Groups',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: '/assignments',
    label: 'Assignments',
    showBadge: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
  },
  {
    href: '/toolkit',
    label: "AI Teacher's Toolkit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/><path d="M10 22h4"/>
      </svg>
    ),
  },
  {
    href: '/library',
    label: 'My Library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const { dark } = useThemeStore();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside
      className="hidden md:flex flex-col z-30 transition-colors"
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        width: '304px',
        height: 'calc(100vh - 24px)',
        borderRadius: '16px',
        padding: '24px',
        background: 'var(--sidebar-bg, #FFFFFF)',
        justifyContent: 'space-between',
        boxShadow: dark
          ? '0 0 0 1px rgba(255,255,255,0.04), 20px 0 60px rgba(0,0,0,0.6), 0 20px 60px rgba(0,0,0,0.5)'
          : '0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Top group ── */}
      <div className="flex flex-col gap-5">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #C62828 100%)' }}
          >
            <span className="text-white font-extrabold text-[20px] leading-none">V</span>
          </div>
          <span className="text-[17px] font-bold text-[#1A1A1A] dark:text-[#F5F5F5] tracking-tight">VedaAI</span>
        </div>

        {/* Create Assignment Button */}
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 w-full text-white text-[13px] font-semibold py-2.5 rounded-full transition-colors"
          style={{
            background: '#111111',
            border: '1.5px solid #E8650A',
            boxShadow: '0 0 8px 0 rgba(232,101,10,0.25)',
            transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = '#E8650A';
            el.style.borderColor = '#FFFFFF';
            el.style.transform = 'scale(1.04)';
            const svg = el.querySelector('svg');
            if (svg) svg.style.color = '#FFFFFF';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = '#111111';
            el.style.borderColor = '#E8650A';
            el.style.transform = 'scale(1)';
            const svg = el.querySelector('svg');
            if (svg) svg.style.color = '#FF8C00';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF8C00]">
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
          </svg>
          Create Assignment
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon, showBadge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  active
                    ? 'bg-[#F4F4F5] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F5F5F5]'
                    : 'text-[#6B6B6B] dark:text-[#B0BAC8] hover:bg-[#F7F7F8] dark:hover:bg-[#1E1E1E] hover:text-[#1A1A1A] dark:hover:text-[#F1F5F9]'
                }`}
              >
                <span className={active ? 'text-[#1A1A1A] dark:text-[#F5F5F5]' : 'text-[#9E9E9E] dark:text-[#666]'}>
                  {icon}
                </span>
                <span className="flex-1 leading-none">{label}</span>
                {showBadge && assignments.length > 0 && (
                  <span className="bg-[#F57C00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {assignments.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom group ── */}
      <div className="flex flex-col gap-2">

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#5F5F5F] dark:text-[#B0BAC8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] hover:text-[#1A1A1A] dark:hover:text-[#F1F5F9] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9E9E9E] dark:text-[#A0AAB8]">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Settings
        </Link>

        {/* School profile card */}
        <div className="flex items-center gap-3 px-3 py-3 bg-[#FFF0E0] dark:bg-[#7C2D00] rounded-xl border border-[#FFCC80] dark:border-[#FF6B00] hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-default">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#FFFFFF] truncate leading-tight">Delhi Public School</p>
            <p className="text-[10px] text-[#9E9E9E] dark:text-[#FFB347] truncate leading-tight mt-0.5">Bokaro Steel City</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
