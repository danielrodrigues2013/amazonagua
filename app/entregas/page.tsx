'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  Phone,
  Navigation,
  MoreVertical
} from 'lucide-react';
import { db } from '@/lib/db';
import { Delivery, DeliveryStatus, Sale, Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setDeliveries(db.getDeliveries());
    setSales(db.getSales());
    setCustomers(db.getCustomers());
  }, []);

  const updateStatus = (id: string, status: DeliveryStatus) => {
    const updated = deliveries.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d);
    setDeliveries(updated);
    db.saveDeliveries(updated);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING: return 'bg-orange-100 text-orange-600 border-orange-200';
      case DeliveryStatus.IN_ROUTE: return 'bg-blue-100 text-blue-600 border-blue-200';
      case DeliveryStatus.DELIVERED: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case DeliveryStatus.CANCELLED: return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING: return 'Pendente';
      case DeliveryStatus.IN_ROUTE: return 'Em Rota';
      case DeliveryStatus.DELIVERED: return 'Entregue';
      case DeliveryStatus.CANCELLED: return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Entregas</h1>
          <p className="text-slate-500">Acompanhe e gerencie as rotas de entrega.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-600">
              {deliveries.filter(d => d.status === DeliveryStatus.PENDING).length} Pendentes
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {deliveries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Truck size={64} className="mx-auto text-slate-200" strokeWidth={1} />
            <p className="text-slate-500 font-medium">Nenhuma entrega registrada no momento.</p>
          </div>
        ) : (
          deliveries.slice().reverse().map((delivery) => {
            const sale = sales.find(s => s.id === delivery.saleId);
            const customer = customers.find(c => c.id === sale?.customerId);

            return (
              <div
                key={delivery.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Status & Info */}
                  <div className="lg:w-1/4 space-y-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(delivery.status)}`}>
                      {getStatusLabel(delivery.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Entrega #{delivery.id.slice(0, 5)}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1" suppressHydrationWarning>
                        <Clock size={12} /> {new Date(delivery.updatedAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="lg:flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <User size={16} className="text-slate-400" />
                      {customer?.name || 'Consumidor Final'}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{customer?.address}, {customer?.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      {customer?.phone || 'N/A'}
                    </div>
                  </div>

                  {/* Deliverer & Actions */}
                  <div className="lg:w-1/4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entregador</span>
                      <span className="text-sm font-bold text-slate-700">{delivery.delivererName}</span>
                    </div>

                    <div className="flex gap-2">
                      {delivery.status === DeliveryStatus.PENDING && (
                        <button
                          onClick={() => updateStatus(delivery.id, DeliveryStatus.IN_ROUTE)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all"
                        >
                          <Navigation size={14} /> Iniciar Rota
                        </button>
                      )}
                      {delivery.status === DeliveryStatus.IN_ROUTE && (
                        <button
                          onClick={() => updateStatus(delivery.id, DeliveryStatus.DELIVERED)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle2 size={14} /> Finalizar
                        </button>
                      )}
                      {(delivery.status === DeliveryStatus.PENDING || delivery.status === DeliveryStatus.IN_ROUTE) && (
                        <button
                          onClick={() => updateStatus(delivery.id, DeliveryStatus.CANCELLED)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
