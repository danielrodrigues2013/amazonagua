'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { Product, Sale, Customer, Delivery } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    setProducts(db.getProducts());
    setSales(db.getSales());
    setCustomers(db.getCustomers());
    setDeliveries(db.getDeliveries());
  }, []);

  const totalSalesToday = sales
    .filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);
  const totalProfitToday = sales
    .filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.profit, 0);
  const criticalStock = products.filter((p) => p.stock <= p.minStock);
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'PENDENTE' || d.status === 'EM_ROTA'
  );

  const stats = [
    { name: 'Vendas Hoje', value: formatCurrency(totalSalesToday), icon: ShoppingCart, color: 'bg-blue-500', trend: '+12%' },
    { name: 'Lucro Hoje', value: formatCurrency(totalProfitToday), icon: TrendingUp, color: 'bg-emerald-500', trend: '+5%' },
    { name: 'Entregas Ativas', value: pendingDeliveries.length.toString(), icon: Truck, color: 'bg-orange-500', trend: 'em rota' },
    { name: 'Estoque Crítico', value: criticalStock.length.toString(), icon: AlertTriangle, color: criticalStock.length > 0 ? 'bg-red-500' : 'bg-slate-400', trend: 'Atenção' },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const salesData = last7Days.map((dateStr) => {
    const daySales = sales.filter((s) => new Date(s.createdAt).toDateString() === dateStr);
    return {
      day: new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'short' }),
      sales: daySales.reduce((acc, s) => acc + s.total, 0),
      profit: daySales.reduce((acc, s) => acc + s.profit, 0),
    };
  });

  const productSalesMap: Record<string, number> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([id, qty]) => ({
      name: products.find((p) => p.id === id)?.name || 'Desconhecido',
      qty,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Bem-vindo de volta, aqui está o resumo do seu depósito.</p>
        </div>
        <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-xs sm:text-sm font-medium text-slate-600 w-fit whitespace-nowrap">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-3 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-2 sm:p-3 rounded-xl text-white`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide text-right leading-tight">{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 text-[11px] sm:text-sm font-medium">{stat.name}</h3>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Desempenho de Vendas</h3>
            <select className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[180px] sm:h-[240px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={45} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 sm:mb-6 text-sm sm:text-base">Top Produtos</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                  0{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{product.name}</span>
                    <span className="text-xs text-slate-500 ml-2 shrink-0">{product.qty} un</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((product.qty / 50) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-4">Sem dados ainda.</p>
            )}
          </div>
          <Link href="/relatorios" className="w-full mt-6 py-2.5 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center">
            Ver Relatório Completo
          </Link>
        </div>
      </div>

      {/* Alerts + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Alertas de Estoque</h3>
          <div className="space-y-3">
            {criticalStock.length > 0 ? criticalStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="text-red-500 shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-red-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-red-700">Estoque: {p.stock} (Mín: {p.minStock})</p>
                  </div>
                </div>
                <Link href="/produtos" className="shrink-0 px-2 sm:px-3 py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-lg hover:bg-red-700">
                  Repor
                </Link>
              </div>
            )) : (
              <p className="text-slate-500 text-sm text-center py-4">Nenhum alerta de estoque.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Últimas Vendas</h3>
          <div className="space-y-2">
            {sales.slice(-4).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-2 sm:p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <ShoppingCart size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800">Venda #{sale.id.slice(0, 5)}</p>
                    <p className="text-[10px] text-slate-500" suppressHydrationWarning>
                      {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Nenhuma venda registrada.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
