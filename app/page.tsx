'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Users,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
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

  const totalSalesToday = sales.filter((s: Sale) => new Date(s.createdAt).toDateString() === new Date().toDateString()).reduce((acc: number, s: Sale) => acc + s.total, 0);
  const totalProfitToday = sales.filter((s: Sale) => new Date(s.createdAt).toDateString() === new Date().toDateString()).reduce((acc: number, s: Sale) => acc + s.profit, 0);
  const criticalStock = products.filter((p: Product) => p.stock <= p.minStock);
  const pendingDeliveries = deliveries.filter((d: Delivery) => d.status === 'PENDENTE' || d.status === 'EM_ROTA');

  const stats = [
    { name: 'Vendas Hoje', value: formatCurrency(totalSalesToday), icon: ShoppingCart, color: 'bg-blue-500', trend: '+12%' },
    { name: 'Lucro Hoje', value: formatCurrency(totalProfitToday), icon: TrendingUp, color: 'bg-emerald-500', trend: '+5%' },
    { name: 'Entregas Ativas', value: pendingDeliveries.length.toString(), icon: Truck, color: 'bg-orange-500', trend: '4 em rota' },
    { name: 'Estoque Crítico', value: criticalStock.length.toString(), icon: AlertTriangle, color: criticalStock.length > 0 ? 'bg-red-500' : 'bg-slate-400', trend: 'Atenção' },
  ];

  // Calculate real chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const salesData = last7Days.map(dateStr => {
    const daySales = sales.filter((s: Sale) => new Date(s.createdAt).toDateString() === dateStr);
    return {
      day: new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'short' }),
      sales: daySales.reduce((acc: number, s: Sale) => acc + s.total, 0),
      profit: daySales.reduce((acc: number, s: Sale) => acc + s.profit, 0),
    };
  });

  // Calculate top products from real sales
  const productSalesMap: Record<string, number> = {};
  sales.forEach((sale: Sale) => {
    sale.items.forEach((item) => {
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([id, qty]) => ({
      name: products.find((p: Product) => p.id === id)?.name || 'Desconhecido',
      qty
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo de volta, aqui está o resumo do seu depósito.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-600">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Desempenho de Vendas</h3>
            <select className="text-sm border-slate-200 rounded-lg focus:ring-blue-500">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Produtos Mais Vendidos</h3>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700">{product.name}</span>
                    <span className="text-sm text-slate-500">{product.qty} un</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(product.qty / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            Ver Relatório Completo
          </button>
        </div>
      </div>

      {/* Recent Activity / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Alertas de Estoque</h3>
          <div className="space-y-4">
            {criticalStock.length > 0 ? criticalStock.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-red-900">{p.name}</p>
                    <p className="text-xs text-red-700">Estoque atual: {p.stock} (Mínimo: {p.minStock})</p>
                  </div>
                </div>
                <Link
                  href="/produtos"
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                >
                  Repor
                </Link>
              </div>
            )) : (
              <p className="text-slate-500 text-sm text-center py-4">Nenhum alerta de estoque no momento.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Últimas Vendas</h3>
          <div className="space-y-4">
            {sales.slice(-4).reverse().map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Venda #{sale.id.slice(0, 5)}</p>
                    <p className="text-xs text-slate-500" suppressHydrationWarning>
                      {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</p>
                  <p className="text-xs text-emerald-600 font-medium">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Nenhuma venda registrada hoje.</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/relatorios"
          className="w-full max-w-xs py-3 text-center text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          Ver Relatório Completo
        </Link>
      </div>
    </div>
  );
}
