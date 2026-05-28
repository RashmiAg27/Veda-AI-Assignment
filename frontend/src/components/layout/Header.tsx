'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

const pageMap: Record<string, { label: string; icon: React.ReactNode }> = {
  '/': {
    label: 'Home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  '/assignments': {
    label: 'Assignments',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  '/groups': {
    label: 'My Groups',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  '/toolkit': {
    label: "AI Teacher's Toolkit",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/><path d="M10 22h4"/>
      </svg>
    ),
  },
  '/library': {
    label: 'My Library',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  '/create': {
    label: 'Create Assignment',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
};

export default function Header() {
  const pathname = usePathname();
  const { dark, toggle } = useThemeStore();

  const isOutput = pathname.startsWith('/output/');
  const isCreate = pathname.startsWith('/create');
  const showBack = isOutput || isCreate;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentPage = Object.entries(pageMap).find(([key]) =>
    key === '/' ? pathname === '/' : pathname.startsWith(key)
  );
  const pageLabel = currentPage?.[1].label ?? '';
  const pageIcon = currentPage?.[1].icon ?? null;

  return (
    <header
      className="hidden md:flex fixed z-20 items-center justify-between transition-colors"
      style={{
        top: '12px',
        left: '340px',
        right: '12px',
        height: '60px',
        background: dark ? '#1A1D27' : '#FFFFFF',
        borderRadius: '16px',
        padding: '0 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left — back button + page icon + title */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <Link
            href="/assignments"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A] text-[#5F5F5F] dark:text-[#9E9E9E] hover:bg-[#EBEBEB] dark:hover:bg-[#333] transition-colors flex-shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A] text-[#5F5F5F] dark:text-[#9E9E9E] flex-shrink-0">
            {pageIcon}
          </div>
        )}
        <span className="text-[14px] font-semibold text-[#1A1A1A] dark:text-[#F5F5F5]">
          {pageLabel}
        </span>
      </div>

      {/* Right — theme toggle + bell + user */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A] ring-1 ring-[#D0D0D0] dark:ring-[#3A3A3A] hover:bg-[#EBEBEB] dark:hover:bg-[#333] transition-colors text-[#5F5F5F] dark:text-[#9E9E9E]"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A] ring-1 ring-[#D0D0D0] dark:ring-[#3A3A3A] hover:bg-[#EBEBEB] dark:hover:bg-[#333] transition-colors text-[#5F5F5F] dark:text-[#9E9E9E]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F57C00] rounded-full border-2 border-white dark:border-[#111111]" />
        </button>

        {/* User */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all duration-200 ${
              userMenuOpen
                ? 'bg-[#E0E0E0] dark:bg-[#333] scale-[1.03] ring-2 ring-[#A0A0A0] dark:ring-[#666] shadow-[0_0_6px_1px_rgba(0,0,0,0.15)] dark:shadow-[0_0_6px_1px_rgba(255,255,255,0.1)]'
                : 'bg-[#F5F5F5] dark:bg-[#2A2A2A] ring-1 ring-[#D0D0D0] dark:ring-[#3A3A3A] hover:bg-[#EBEBEB] dark:hover:bg-[#333] hover:scale-[1.03] hover:ring-2 hover:ring-[#A0A0A0] dark:hover:ring-[#666] hover:shadow-[0_0_6px_1px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_6px_1px_rgba(255,255,255,0.1)]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-[11px] font-bold">
              R
            </div>
            <span className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">Rashmi Agrawal</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9E9E9E]">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-10 bg-[#1E2535] rounded-lg shadow-lg z-50 min-w-[110px] overflow-hidden py-0.5">
              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-3 py-2 text-[12px] text-white hover:bg-white/10 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left flex items-center px-3 py-2 text-[12px] text-white hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
