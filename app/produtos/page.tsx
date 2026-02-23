'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, AlertCircle, ArrowUpRight, Droplets, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { Product, ProductType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | ProductType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      type: formData.get('type') as ProductType,
      category: formData.get('category') as string,
      purchasePrice: Number(formData.get('purchasePrice')),
      salePrice: Number(formData.get('salePrice')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
      active: true,
    };
    const updated = editingProduct
      ? products.map((p) => (p.id === editingProduct.id ? newProduct : p))
      : [...products, newProduct];
    setProducts(updated);
    db.saveProducts(updated);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      db.saveProducts(updated);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Produtos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie seu estoque de água e gás.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', ProductType.WATER, ProductType.GAS] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${filterType === type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {type === 'ALL' ? 'Todos' : type === ProductType.WATER ? 'Água' : 'Gás'}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${product.type === ProductType.WATER ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {product.type === ProductType.WATER ? <Droplets size={22} /> : <Flame size={22} />}
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1 truncate">{product.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">{product.category}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venda</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">{formatCurrency(product.salePrice)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estoque</p>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-base sm:text-lg font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.stock}
                    </p>
                    {product.stock <= product.minStock && <AlertCircle size={14} className="text-red-500" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs sm:text-sm">
                  <ArrowUpRight size={14} />
                  {Math.round(((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100)}% margem
                </div>
                <div className="text-[10px] text-slate-400">
                  Custo: {formatCurrency(product.purchasePrice)}
                </div>
              </div>
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
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSave} className="p-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 sm:mb-6">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                      <select name="type" defaultValue={editingProduct?.type || ProductType.WATER} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        <option value={ProductType.WATER}>Água</option>
                        <option value={ProductType.GAS}>Gás</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                      <input name="category" defaultValue={editingProduct?.category} placeholder="Ex: Galão 20L" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Preço de Compra</label>
                      <input name="purchasePrice" type="number" step="0.01" defaultValue={editingProduct?.purchasePrice} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Preço de Venda</label>
                      <input name="salePrice" type="number" step="0.01" defaultValue={editingProduct?.salePrice} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Estoque Inicial</label>
                      <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Estoque Mínimo</label>
                      <input name="minStock" type="number" defaultValue={editingProduct?.minStock || 5} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => { deleteProduct(editingProduct.id); setIsModalOpen(false); }}
                      className="flex-1 min-w-[120px] px-4 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 min-w-[100px] px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] min-w-[120px] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all text-sm"
                  >
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
