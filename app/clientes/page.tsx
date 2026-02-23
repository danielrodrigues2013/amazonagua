'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Phone, MapPin, Edit2, MessageSquare, UserPlus, CreditCard, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(db.getCustomers());
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer: Customer = {
      id: editingCustomer?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      neighborhood: formData.get('neighborhood') as string,
      notes: formData.get('notes') as string,
      creditLimit: Number(formData.get('creditLimit')),
      status: 'ADIMPLENTE',
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };
    const updated = editingCustomer
      ? customers.map((c) => (c.id === editingCustomer.id ? newCustomer : c))
      : [...customers, newCustomer];
    setCustomers(updated);
    db.saveCustomers(updated);
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const deleteCustomer = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      db.saveCustomers(updated);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie sua base de clientes e histórico.</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all text-sm w-full sm:w-auto"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </header>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou bairro..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-base sm:text-lg shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${customer.status === 'ADIMPLENTE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {customer.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{customer.address}, {customer.neighborhood}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <CreditCard size={14} className="text-slate-400 shrink-0" />
                Limite: {formatCurrency(customer.creditLimit)}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => openWhatsApp(customer.phone)}
                className="flex-[2] flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare size={14} /> WhatsApp
              </button>
              <button
                onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                className="flex-[2] flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 size={14} /> Editar
              </button>
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="flex-1 flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSave} className="p-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                    <input name="name" defaultValue={editingCustomer?.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input name="phone" defaultValue={editingCustomer?.phone} placeholder="(11) 99999-9999" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Endereço</label>
                    <input name="address" defaultValue={editingCustomer?.address} placeholder="Rua, Número, Complemento" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Bairro</label>
                      <input name="neighborhood" defaultValue={editingCustomer?.neighborhood} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Limite de Crédito</label>
                      <input name="creditLimit" type="number" defaultValue={editingCustomer?.creditLimit || 0} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Observações</label>
                    <textarea name="notes" defaultValue={editingCustomer?.notes} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-sm" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  {editingCustomer && (
                    <button
                      type="button"
                      onClick={() => { deleteCustomer(editingCustomer.id); setIsModalOpen(false); }}
                      className="flex-1 min-w-[110px] px-4 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  )}
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 min-w-[100px] px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] min-w-[100px] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all text-sm">
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
