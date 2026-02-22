'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  Droplets,
  Flame,
  History,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { name: 'Histórico', href: '/vendas/historico', icon: History },
  { name: 'Entregas', href: '/entregas', icon: Truck },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initial Auth check
    const auth = localStorage.getItem('amazon-agua-auth');
    if (auth !== 'true' && pathname !== '/login') {
      router.push('/login');
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('amazon-agua-auth');
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] p-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl md:hidden shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-950 text-slate-300 border-r border-slate-800 z-40 flex flex-col overflow-hidden transition-transform md:transition-[width] duration-200 ease-in-out will-change-transform",
          isMobile
            ? (isOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]")
            : (isOpen ? "w-[260px]" : "w-[80px]")
        )}
      >
        <div className="p-6 pt-20 md:pt-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 relative">
            <Droplets size={24} className="absolute translate-x-[-4px] translate-y-[-4px]" />
            <Flame size={24} className="absolute translate-x-[4px] translate-y-[4px] text-orange-400" />
          </div>
          <span className={cn(
            "font-bold text-xl text-white tracking-tight truncate transition-opacity duration-150",
            (!isOpen && !isMobile) ? "opacity-0" : "opacity-100"
          )}>
            Amazon<span className="text-blue-500"> Água</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "hover:bg-slate-900 hover:text-white"
                )}
              >
                <item.icon size={22} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
                <span className={cn(
                  "font-medium transition-opacity duration-150",
                  (!isOpen && !isMobile) ? "opacity-0" : "opacity-100"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/configuracoes"
            onClick={() => isMobile && setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl hover:bg-slate-900 transition-colors group text-slate-400"
          >
            <Settings size={22} className="group-hover:text-white transition-colors" />
            <span className={cn(
              "font-medium transition-opacity duration-200",
              (!isOpen && !isMobile) ? "opacity-0" : "opacity-100"
            )}>
              Configurações
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl hover:bg-red-500/10 transition-colors group text-slate-400 hover:text-red-400"
          >
            <LogOut size={22} className="group-hover:text-red-400 transition-colors" />
            <span className={cn(
              "font-medium transition-opacity duration-200",
              (!isOpen && !isMobile) ? "opacity-0" : "opacity-100"
            )}>
              Sair do Sistema
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
