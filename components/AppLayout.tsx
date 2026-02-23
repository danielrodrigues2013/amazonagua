'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 w-full md:ml-[260px] p-3 sm:p-4 md:p-6 lg:p-8 pt-16 md:pt-6 min-h-screen transition-[margin] duration-200 ease-in-out overflow-x-hidden">
                <div className="max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
