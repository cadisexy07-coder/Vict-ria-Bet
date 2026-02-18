
import React, { useState, useEffect } from 'react';
import { Forecast, User, UserRole, DBUser } from '../types';
import { database } from '../services/db';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [tab, setTab] = useState<'tips' | 'users'>('tips');
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [newForecast, setNewForecast] = useState({
    league: '',
    match: '',
    prediction: '',
    probability: 80,
    riskLevel: 'Médio' as 'Baixo' | 'Médio' | 'Alto'
  });

  const loadData = async () => {
    const f = await database.getForecasts();
    const u = await database.getUsers();
    setForecasts(f);
    setUsers(u);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await database.updateForecast(isEditing, newForecast);
      setIsEditing(null);
    } else {
      const forecast: Forecast = {
        id: Math.random().toString(36).substr(2, 9),
        ...newForecast,
        analysis: '',
        createdAt: new Date().toISOString(),
        result: 'Pending'
      };
      await database.saveForecast(forecast);
    }
    
    await loadData();
    setNewForecast({ league: '', match: '', prediction: '', probability: 80, riskLevel: 'Médio' });
  };

  const handleEditClick = (f: Forecast) => {
    setIsEditing(f.id);
    setNewForecast({
      league: f.league,
      match: f.match,
      prediction: f.prediction,
      probability: f.probability,
      riskLevel: f.riskLevel
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setNewForecast({ league: '', match: '', prediction: '', probability: 80, riskLevel: 'Médio' });
  };

  const handleDeleteForecast = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este prognóstico?')) {
      await database.deleteForecast(id);
      await loadData();
    }
  };

  const handleApproveUser = async (userId: string) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    await database.updateUser(userId, {
      isActive: true,
      isPendingApproval: false,
      expirationDate: expirationDate.toISOString()
    });

    await loadData();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestão Victória Bet</h2>
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Painel do Criador</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTab('tips')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'tips' ? 'gold-gradient text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            Prognósticos
          </button>
          <button 
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'users' ? 'gold-gradient text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            Contas VIP
          </button>
        </div>
      </div>

      {tab === 'tips' ? (
        <div className="space-y-8">
          {/* Status Meta 4 Palpites */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${forecasts.length >= 4 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Palpites Ativos: <span className="text-gray-900">{forecasts.length} / 4</span></p>
            </div>
            {forecasts.length < 4 && <span className="text-[10px] font-bold text-amber-600 uppercase">Faltam {4 - forecasts.length} para a meta diária</span>}
          </div>

          <form onSubmit={handleSaveForecast} className="glass-card p-6 rounded-2xl border border-gray-100 space-y-4 shadow-xl">
            <h3 className="font-black text-lg mb-2 gold-text uppercase tracking-tighter">
              {isEditing ? 'Editar Prognóstico' : 'Adicionar Novo Prognóstico'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Competição</label>
                <input 
                  placeholder="Ex: Premier League"
                  className="w-full input-premium p-3 rounded-xl outline-none"
                  value={newForecast.league}
                  onChange={e => setNewForecast({...newForecast, league: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Equipas</label>
                <input 
                  placeholder="Ex: Man City vs Liverpool"
                  className="w-full input-premium p-3 rounded-xl outline-none"
                  value={newForecast.match}
                  onChange={e => setNewForecast({...newForecast, match: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mercado Recomendado</label>
                <input 
                  placeholder="Ex: Mais 2.5 Golos"
                  className="w-full input-premium p-3 rounded-xl outline-none"
                  value={newForecast.prediction}
                  onChange={e => setNewForecast({...newForecast, prediction: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confiança %</label>
                  <input 
                    type="number"
                    className="w-full input-premium p-3 rounded-xl outline-none"
                    value={newForecast.probability}
                    onChange={e => setNewForecast({...newForecast, probability: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="w-1/2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Risco</label>
                  <select 
                    className="w-full input-premium p-3 rounded-xl outline-none"
                    value={newForecast.riskLevel}
                    onChange={e => setNewForecast({...newForecast, riskLevel: e.target.value as any})}
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 gold-gradient text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 uppercase text-xs tracking-widest">
                {isEditing ? 'Salvar Alterações' : 'Publicar Prognóstico'}
              </button>
              {isEditing && (
                <button type="button" onClick={cancelEdit} className="px-6 py-4 bg-gray-100 text-gray-500 font-black rounded-xl uppercase text-xs tracking-widest">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="font-black text-xs text-gray-400 uppercase tracking-[0.2em] px-1 mb-4">Lista de Prognósticos Publicados</h3>
            {forecasts.map(f => (
              <div key={f.id} className="flex justify-between items-center p-5 glass-card rounded-2xl border border-gray-100 hover:border-amber-200 transition-all group">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{f.league}</span>
                  <p className="font-bold text-gray-900">{f.match}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{f.prediction} • <span className="text-green-600">{f.probability}% confiança</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(f)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteForecast(f.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {forecasts.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">Nenhum dado registado na base de dados.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-black text-xs text-gray-400 uppercase tracking-[0.2em] px-1 mb-4">Auditoria de Subscritores VIP</h3>
          {users.filter(u => u.role !== UserRole.ADMIN).map(u => (
            <div key={u.id} className="p-5 glass-card rounded-[2rem] border border-gray-100 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-lg text-gray-900 tracking-tighter leading-tight">{u.fullName}</p>
                  <p className="text-xs text-gray-500 font-medium">{u.email} • {u.phone}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.isActive ? 'bg-green-500/10 text-green-600 border border-green-500/20' : u.isPendingApproval ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                  {u.isActive ? 'Ativo' : u.isPendingApproval ? 'Verificação Necessária' : 'Inativo'}
                </div>
              </div>

              {u.isPendingApproval && u.paymentProof && (
                <div className="mt-2 space-y-4">
                  <div className="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-gray-50 shadow-inner group relative">
                    <img src={u.paymentProof} alt="Comprovativo" className="w-full object-contain h-48 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-[8px] font-black uppercase shadow-sm">Comprovativo MCX</div>
                  </div>
                  <button 
                    onClick={() => handleApproveUser(u.id)}
                    className="w-full gold-gradient text-white font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-amber-500/10 uppercase text-xs tracking-widest"
                  >
                    Aprovar Acesso VIP
                  </button>
                </div>
              )}
              
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-4 mt-2">
                <span className="font-medium">Membro desde: {new Date(u.createdAt).toLocaleDateString('pt-AO')}</span>
                {u.isActive && u.expirationDate && (
                  <span className="font-black text-amber-600 uppercase tracking-widest">Expira a: {new Date(u.expirationDate).toLocaleDateString('pt-AO')}</span>
                )}
              </div>
            </div>
          ))}
          {users.filter(u => u.role !== UserRole.ADMIN).length === 0 && (
             <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">Sem utilizadores registados na plataforma.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
