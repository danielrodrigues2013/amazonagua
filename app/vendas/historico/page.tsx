'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  FileText,
  Printer,
  Eye,
  ArrowLeft,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { Sale, Product, Customer } from '@/lib/types';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import Link from 'next/link';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    setSales(db.getSales());
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());
  }, []);

  const filteredSales = sales.filter(s => {
    const customer = customers.find(c => c.id === s.customerId);
    const customerName = customer?.name || 'Consumidor Final';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/vendas" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Histórico de Vendas</h1>
            <p className="text-slate-500">Consulte e gerencie todas as vendas realizadas.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(sales, 'vendas_historico')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={18} /> Exportar
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID da venda..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold">
          <Calendar size={18} /> Hoje
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold">
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                filteredSales.slice().reverse().map((sale) => {
                  const customer = customers.find(c => c.id === sale.customerId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{sale.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600" suppressHydrationWarning>
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')} {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{customer?.name || 'Consumidor Final'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${sale.type === 'DELIVERY' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                          {sale.type === 'DELIVERY' ? 'Entrega' : 'Balcão'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sale.paymentMethod}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(sale.total)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSale(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Detalhes da Venda</h2>
                  <p className="text-sm text-slate-500">Venda #{selectedSale.id.slice(0, 8)}</p>
                </div>

                <div className="space-y-4 border-t border-b border-slate-100 py-6">
                  {selectedSale.items.map((item, i) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.quantity}x {product?.name}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(selectedSale.total)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 uppercase font-bold">Pagamento</span>
                    <span className="text-slate-900 font-bold">{selectedSale.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 uppercase font-bold">Lucro Estimado</span>
                    <span className="text-emerald-600 font-bold">{formatCurrency(selectedSale.profit)}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Fechar
                  </button>
                  <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Printer size={18} /> Imprimir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
