import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0F294A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Bhavani Science Classes - Portal',
  description: 'Official portal for Bhavani Science Classes (Virar West) - Student dashboard, timetable, marks, fee receipts, UPI payment, and video lectures.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bhavani STEM',
  },
  icons: {
    icon: [
      { url: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png',
    apple: [
      { url: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Bhavani Science Classes - Portal',
    description: 'Official portal for Bhavani Science Classes (Virar West) - Student dashboard, timetable, marks, fee receipts, UPI payment, and video lectures.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhavani Science Classes - Portal',
    description: 'Official portal for Bhavani Science Classes (Virar West) - Student dashboard, timetable, marks, fee receipts, UPI payment, and video lectures.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem('bsc_dark_mode');
                if (saved === 'true') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            })()`,
          }}
        />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

