'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Database, 
  Smartphone,
  Save,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Geral');
  const [appName, setAppName] = useState('Amazon Água');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    const savedName = localStorage.getItem('app_name');
    if (savedName) setAppName(savedName);
  }, []);

  const handleClearData = () => {
    if (confirm('TEM CERTEZA? Isso apagará todas as vendas, clientes e produtos permanentemente.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSave = () => {
    localStorage.setItem('app_name', appName);
    alert('Configurações salvas com sucesso!');
  };

  const tabs = [
    { name: 'Geral', icon: Settings },
    { name: 'Perfil', icon: User },
    { name: 'Notificações', icon: Bell },
    { name: 'Segurança', icon: Shield },
    { name: 'Dados', icon: Database },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-slate-500">Gerencie as preferências e ajustes do sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {tabs.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === item.name 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'Geral' && (
              <motion.section
                key="geral"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone size={20} className="text-blue-600" />
                  Ajustes do Sistema
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Empresa</label>
                    <input 
                      type="text" 
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-slate-900">Notificações Push</p>
                      <p className="text-sm text-slate-500">Receba alertas de estoque e vendas.</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-slate-900">Modo Escuro</p>
                      <p className="text-sm text-slate-500">Ajuste a interface para ambientes escuros.</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all"
                  >
                    <Save size={20} />
                    Salvar Alterações
                  </button>
                </div>
              </motion.section>
            )}

            {activeTab === 'Dados' && (
              <motion.section
                key="dados"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm space-y-4"
              >
                <h3 className="font-bold text-red-600 flex items-center gap-2">
                  <Trash2 size={20} />
                  Zona de Perigo
                </h3>
                <p className="text-sm text-slate-500">
                  Ações nesta seção são permanentes e não podem ser desfeitas.
                </p>
                <button 
                  onClick={handleClearData}
                  className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                >
                  Limpar Todos os Dados
                </button>
              </motion.section>
            )}

            {activeTab === 'Perfil' && (
              <motion.section
                key="perfil"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Perfil do Administrador
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Usuário</label>
                    <input type="text" defaultValue="Administrador" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
                    <input type="email" defaultValue="admin@amazongua.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Salvar Perfil</button>
              </motion.section>
            )}

            {activeTab === 'Notificações' && (
              <motion.section
                key="notificacoes"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" />
                  Preferências de Alerta
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Alertas de Estoque Baixo', desc: 'Notificar quando um produto atingir o estoque mínimo.' },
                    { label: 'Relatório Diário de Vendas', desc: 'Receber resumo de vendas ao final do dia.' },
                    { label: 'Novos Clientes', desc: 'Notificar quando um novo cliente for cadastrado.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="font-bold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-blue-600 relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
            {activeTab === 'Segurança' && (
              <motion.section
                key="seguranca"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={20} className="text-blue-600" />
                  Segurança da Conta
                </h3>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alterar Senha</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Senha Atual</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nova Senha</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Nova Senha</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => alert('Senha alterada com sucesso!')} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                      Atualizar Senha
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Extra Security */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Autenticação e Acesso</h4>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-slate-900">Autenticação em Duas Etapas (2FA)</p>
                        <p className="text-sm text-slate-500">Adicione uma camada extra de segurança à sua conta.</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-slate-200 relative">
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-slate-900">Alertas de Login</p>
                        <p className="text-sm text-slate-500">Receba um e-mail sempre que houver um novo acesso.</p>
                      </div>
                      <button className="w-12 h-6 rounded-full bg-blue-600 relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sessões Ativas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">Este Dispositivo (Chrome / Windows)</p>
                            <p className="text-xs text-emerald-600 font-medium">Ativo agora • São Paulo, Brasil</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-sm font-bold text-red-600 hover:text-red-700">
                      Encerrar todas as outras sessões
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
