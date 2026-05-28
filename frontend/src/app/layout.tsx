import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'VedaAI — AI Assessment Creator',
  description: 'Create AI-powered assessments and question papers for your students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body>
        <ThemeProvider>
          {/* Desktop sidebar + header */}
          <Sidebar />
          <Header />

          <main
            className="md:ml-[328px] pt-14 md:pt-[84px] min-h-screen bg-[#F0F2F5] dark:bg-[#0F1117] pb-20 md:pb-0"
            style={{ minHeight: '100vh' }}
          >
            {children}
          </main>

          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontSize: '13px', borderRadius: '10px', background: '#1A1A1A', color: '#fff' },
              success: { style: { background: '#1A1A1A' } },
              error: { style: { background: '#D32F2F' } },
            }}
          />

          {/* Mobile UI */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
