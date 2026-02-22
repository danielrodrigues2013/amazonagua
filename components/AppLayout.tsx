'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 md:ml-[260px] p-4 md:p-8 pt-16 md:pt-8 min-h-screen transition-[margin] duration-200 ease-in-out">
                {children}
            </main>
        </div>
    );
}
