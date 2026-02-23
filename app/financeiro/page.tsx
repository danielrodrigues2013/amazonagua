'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Search, Download, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/db';
import { Transaction, TransactionType } from '@/lib/types';
import { formatCurrency, exportToCSV } from '@/lib/utils';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setTransactions(db.getTransactions());
  }, []);

  const totalIncome = transactions.filter((t) => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as TransactionType,
      category: formData.get('category') as string,
      date: new Date().toISOString(),
      status: 'PAGO',
    };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    db.saveTransactions(updated);
    setIsModalOpen(false);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      db.saveTransactions(updated);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de entradas, saídas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportToCSV(transactions, 'financeiro')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs sm:text-sm"
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all text-xs sm:text-sm"
          >
            <Plus size={18} /> Nova Transação
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-emerald-100 p-2.5 sm:p-3 rounded-xl text-emerald-600">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Entradas</span>
          </div>
          <h3 className="text-slate-500 text-xs sm:text-sm font-medium">Total Recebido</h3>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-red-100 p-2.5 sm:p-3 rounded-xl text-red-600">
              <ArrowDownCircle size={20} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Saídas</span>
          </div>
          <h3 className="text-slate-500 text-xs sm:text-sm font-medium">Total Pago</h3>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-600 p-2.5 sm:p-3 rounded-xl text-white">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Saldo Geral</span>
          </div>
          <h3 className="text-slate-400 text-xs sm:text-sm font-medium">Saldo em Caixa</h3>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Histórico de Transações</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Buscar..." className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[520px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Data</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Descrição</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">Categoria</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Valor</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 sm:py-12 text-center text-slate-500 text-sm">
                    Nenhuma transação registrada.
                  </td>
                </tr>
              ) : (
                transactions.slice().reverse().map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap" suppressHydrationWarning>
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm max-w-[140px] sm:max-w-none truncate">{t.description}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 font-bold whitespace-nowrap text-xs sm:text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">
                        {t.status === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">Nova Transação</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                <input name="description" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor</label>
                  <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                  <select name="type" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value={TransactionType.INCOME}>Entrada</option>
                    <option value={TransactionType.EXPENSE}>Saída</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                <input name="category" placeholder="Ex: Aluguel, Fornecedor..." required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 text-sm">Salvar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
