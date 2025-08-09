// app/layout.tsx
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/app/providers';
import { Toaster } from '@/app/components/ui/toaster';
import { UserProvider } from '@/app/lib/user-context';
import { PropertyProvider } from './lib/PropertyContext';
import SessionHandler from '@/app/components/SessionHandler'; // Add this import
import './globals.css';
import { JobProvider } from '@/app/lib/JobContext';
import { PreventiveMaintenanceProvider } from '@/app/lib/PreventiveContext';
import { FilterProvider } from '@/app/lib/FilterContext';

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Your existing metadata (unchanged)
export const metadata: Metadata = {
  title: {
    default: 'Maintenance & Job Management Dashboard',
    template: '%s | Maintenance & Job Management Dashboard',
  },
  description: 'Streamline property maintenance and job management with our Next.js-powered dashboard. Track, assign, and manage tasks efficiently using TypeScript, Tailwind CSS, and NextAuth.',
  keywords: [
    'maintenance management',
    'job management',
    'property maintenance',
    'task tracking',
    'admin dashboard',
    'nextjs',
    'typescript',
    'tailwind css',
    'nextauth',
    'facility management',
  ],
  authors: [
    {
      name: 'Your Name',
      url: 'https://pmcs.site',
    },
  ],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pmcs.site',
    title: 'Maintenance & Job Management Dashboard',
    description: 'Efficiently manage maintenance tasks and jobs with our modern admin dashboard built with Next.js, Postgres, NextAuth, and Tailwind CSS. Perfect for property managers and facility teams.',
    siteName: 'Maintenance & Job Management Dashboard',
    images: [
      {
        url: 'https://pmcs.site/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maintenance & Job Management Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maintenance & Job Management Dashboard',
    description: 'A powerful tool for property maintenance and job management, built with Next.js, TypeScript, and Tailwind CSS. Track and manage tasks seamlessly.',
    creator: '@yourtwitter',
    images: ['https://pmcs.site/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <AuthProvider>
          <SessionHandler> {/* Add SessionHandler here, inside AuthProvider */}
            <UserProvider>
              <PropertyProvider>
                <JobProvider>
                  <PreventiveMaintenanceProvider>
                    <FilterProvider>
                      <main className="flex min-h-screen w-full flex-col">
                        {children}
                      </main>
                      <Toaster />
                    </FilterProvider>
                  </PreventiveMaintenanceProvider>
                </JobProvider>
              </PropertyProvider>
            </UserProvider>
          </SessionHandler>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
