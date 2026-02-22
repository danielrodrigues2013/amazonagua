'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { Product, Customer, Sale, SaleItem, PaymentMethod, SaleType, TransactionType, ProductType, DeliveryStatus } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Droplets,
  Flame
} from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [saleType, setSaleType] = useState<SaleType>(SaleType.COUNTER);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.active
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, price: product.salePrice }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.productId !== productId));
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinalize = () => {
    if (cart.length === 0) return;

    const profit = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return acc;
      return acc + ((item.price - product.purchasePrice) * item.quantity);
    }, 0);

    const newSale: Sale = {
      id: crypto.randomUUID(),
      customerId: selectedCustomer?.id,
      items: cart,
      total,
      profit,
      paymentMethod,
      type: saleType,
      status: 'CONCLUIDA',
      createdAt: new Date().toISOString(),
    };

    // Update DB
    const sales = db.getSales();
    db.saveSales([...sales, newSale]);

    // Update Stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    db.saveProducts(updatedProducts);
    setProducts(updatedProducts);

    // If delivery, create delivery record
    if (saleType === SaleType.DELIVERY) {
      const deliveries = db.getDeliveries();
      db.saveDeliveries([...deliveries, {
        id: crypto.randomUUID(),
        saleId: newSale.id,
        delivererName: 'Pendente',
        status: DeliveryStatus.PENDING,
        deliveryFee: 5,
        commission: 2,
        updatedAt: new Date().toISOString(),
      }]);
    }

    // Create financial transaction
    const transactions = db.getTransactions();
    db.saveTransactions([...transactions, {
      id: crypto.randomUUID(),
      description: `Venda #${newSale.id.slice(0, 8)}`,
      amount: newSale.total,
      type: TransactionType.INCOME,
      category: 'Vendas',
      date: new Date().toISOString(),
      status: 'PAGO',
    }]);

    // Success state
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCart([]);
      setSelectedCustomer(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nova Venda</h1>
          <p className="text-slate-500">Selecione os produtos para o carrinho.</p>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produto..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${product.type === ProductType.WATER ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {product.type === ProductType.WATER ? <Droplets size={24} /> : <Flame size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                <p className="text-sm text-slate-500">{formatCurrency(product.salePrice)}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  Estoque: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-xl text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            Carrinho
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-sm font-medium">Carrinho vazio</p>
            </div>
          ) : (
            cart.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={item.productId} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{product?.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => removeFromCart(item.productId)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => addToCart(product!)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</label>
            <select
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
              value={selectedCustomer?.id || ''}
            >
              <option value="">Consumidor Final</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sale Type & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo</label>
              <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setSaleType(SaleType.COUNTER)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${saleType === SaleType.COUNTER ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Store size={14} /> Balcão
                </button>
                <button
                  onClick={() => setSaleType(SaleType.DELIVERY)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${saleType === SaleType.DELIVERY ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Truck size={14} /> Entrega
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pagamento</label>
              <select
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value={PaymentMethod.PIX}>PIX</option>
                <option value={PaymentMethod.CASH}>Dinheiro</option>
                <option value={PaymentMethod.CARD}>Cartão</option>
                <option value={PaymentMethod.CREDIT}>Fiado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || isSuccess}
            onClick={handleFinalize}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${isSuccess
              ? 'bg-emerald-500 text-white'
              : cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
          >
            {isSuccess ? (
              <><CheckCircle2 size={24} /> Venda Realizada!</>
            ) : (
              'Finalizar Venda'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
