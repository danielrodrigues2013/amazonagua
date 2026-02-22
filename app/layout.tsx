import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Amazon Água',
  description: 'Sistema completo para gerenciamento de depósitos de água e gás.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
