'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/library',
    label: 'Library',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  {
    href: '/toolkit',
    label: 'AI Toolkit',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { dark, toggle } = useThemeStore();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Mobile Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#111111] border-b border-[#EBEBEB] dark:border-[#2A2A2A] flex items-center justify-between px-4 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #C62828 100%)' }}
          >
            <span className="text-white font-extrabold text-[18px] leading-none">V</span>
          </div>
          <span className="text-[16px] font-bold text-[#1A1A1A] dark:text-[#F5F5F5] tracking-tight">VedaAI</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#5F5F5F] dark:text-[#9E9E9E]"
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* Bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#5F5F5F] dark:text-[#9E9E9E]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F57C00] rounded-full border-2 border-white dark:border-[#111]" />
          </button>

          {/* Avatar */}
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-[11px] font-bold ml-1">
            R
          </button>

          {/* Hamburger */}
          <button className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] dark:text-[#F5F5F5] ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── FAB (Create Assignment) ── */}
      <Link
        href="/create"
        className="md:hidden fixed bottom-20 right-4 w-13 h-13 rounded-full flex items-center justify-center z-40 shadow-lg"
        style={{
          width: '52px',
          height: '52px',
          background: 'linear-gradient(135deg, #FF8C00 0%, #C62828 100%)',
          boxShadow: '0 4px 16px rgba(232,101,10,0.4)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </Link>

      {/* ── Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1A1A1A] dark:bg-[#0A0A0A] flex items-center justify-around z-40">
        {navItems.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <span className={active ? 'text-white' : 'text-white/40'}>
                {icon()}
              </span>
              <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-white/40'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
