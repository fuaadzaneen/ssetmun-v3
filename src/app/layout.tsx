import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SSET MUN 2026 – Delegate Allotment & Operations Dashboard (v3)',
  description: 'Official Delegate Allotment, CA Code Resolution, and Email Dispatch Engine for SSETMUN 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#061619] text-[#f5f4ef] font-sans selection:bg-[#ccb154] selection:text-[#061619]">
        {children}
      </body>
    </html>
  );
}
