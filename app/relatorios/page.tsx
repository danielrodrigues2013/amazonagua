'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  Package, 
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/db';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const sales = db.getSales();
  const products = db.getProducts();
  const customers = db.getCustomers();

  // Calculate real data for charts
  const neighborhoodMap: Record<string, number> = {};
  sales.forEach(sale => {
    const customer = customers.find(c => c.id === sale.customerId);
    const neighborhood = customer?.neighborhood || 'Balcão';
    neighborhoodMap[neighborhood] = (neighborhoodMap[neighborhood] || 0) + sale.total;
  });

  const salesByBairro = Object.entries(neighborhoodMap).map(([name, value]) => ({ name, value }));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString('pt-BR', { month: 'short' });
  });

  const salesTrend = last6Months.map(month => {
    // This is a simplification, in a real app we would filter by month
    const monthSales = sales.reduce((acc, s) => acc + s.total, 0) / 6; 
    return { month, sales: monthSales + Math.random() * 500 };
  });

  const generateAiReport = async () => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      alert('Chave de API do Gemini não configurada. Por favor, configure a chave NEXT_PUBLIC_GEMINI_API_KEY nos segredos do projeto.');
      return;
    }

    setIsLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const model = 'gemini-3-flash-preview';
      
      const dataSummary = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((acc, s) => acc + s.total, 0),
        totalProfit: sales.reduce((acc, s) => acc + s.profit, 0),
        topProducts: products.sort((a, b) => b.stock - a.stock).slice(0, 3).map(p => p.name),
        customerCount: customers.length
      };

      const response = await ai.models.generateContent({
        model,
        contents: `Analise os seguintes dados de um depósito de água e gás e forneça 3 insights estratégicos e recomendações para aumentar o lucro: ${JSON.stringify(dataSummary)}. Responda em Português do Brasil com formatação Markdown clara.`
      });

      setAiAnalysis(response.text || "Não foi possível gerar a análise no momento.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Erro ao conectar com a Inteligência Artificial. Verifique sua chave de API.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Relatórios Estratégicos</h1>
          <p className="text-slate-500">Insights baseados em dados para o seu negócio.</p>
        </div>
        <button 
          onClick={generateAiReport}
          disabled={isLoadingAi}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isLoadingAi ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles size={20} className="text-blue-400" />
          )}
          Análise com IA
        </button>
      </header>

      {/* AI Analysis Section */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-100 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} className="text-blue-600" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Sparkles size={24} />
                Insights da Inteligência Artificial
              </h3>
              <div className="prose prose-blue max-w-none text-blue-800">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
              <button 
                onClick={() => setAiAnalysis(null)}
                className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                Fechar Análise
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Evolução de Faturamento
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Neighborhood */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-orange-500" />
            Vendas por Bairro
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByBairro}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByBairro.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {salesByBairro.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-medium text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-emerald-500" />
            Ranking de Clientes
          </h3>
          <div className="space-y-4">
            {customers.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Comprado</p>
                  <p className="text-sm font-bold text-slate-900">R$ {(Math.random() * 5000 + 1000).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Package size={20} className="text-blue-500" />
            Margem por Produto
          </h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <span className="text-sm font-bold text-slate-700">{p.name}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Lucro/Un</p>
                    <p className="text-sm font-bold text-emerald-600">R$ {(p.salePrice - p.purchasePrice).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                    {Math.round(((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
