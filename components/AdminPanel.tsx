
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
      <div className="flex justify-between items-center mb-8 bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center text-black font-black">ADM</div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter">Painel Victória</h2>
            <p className="text-[8px] text-amber-500 uppercase font-black tracking-[0.3em]">Operações Elite</p>
          </div>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2 border border-white/5">
          <button 
            onClick={() => setTab('tips')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'tips' ? 'gold-gradient text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'}`}
          >
            TIPS
          </button>
          <button 
            onClick={() => setTab('users')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'users' ? 'gold-gradient text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'}`}
          >
            VIPs
          </button>
        </div>
      </div>

      {tab === 'tips' ? (
        <div className="space-y-8">
          <form onSubmit={handleSaveForecast} className="glass-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
               <h3 className="font-black text-sm text-amber-500 uppercase tracking-[0.2em]">{isEditing ? 'Atualizar Prognóstico' : 'Lançar Nova TIP'}</h3>
               {isEditing && <button onClick={cancelEdit} className="text-[10px] text-gray-500 font-bold uppercase underline">Cancelar</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                placeholder="Competição (ex: Champions)"
                className="w-full input-dark p-4 rounded-xl outline-none text-sm font-medium"
                value={newForecast.league}
                onChange={e => setNewForecast({...newForecast, league: e.target.value})}
                required
              />
              <input 
                placeholder="Jogo (Equipa A vs B)"
                className="w-full input-dark p-4 rounded-xl outline-none text-sm font-medium"
                value={newForecast.match}
                onChange={e => setNewForecast({...newForecast, match: e.target.value})}
                required
              />
              <input 
                placeholder="Mercado Sugerido"
                className="w-full input-dark p-4 rounded-xl outline-none text-sm font-medium"
                value={newForecast.prediction}
                onChange={e => setNewForecast({...newForecast, prediction: e.target.value})}
                required
              />
              <div className="flex gap-4">
                <input 
                  type="number" placeholder="Confiança %"
                  className="w-1/2 input-dark p-4 rounded-xl outline-none text-sm"
                  value={newForecast.probability}
                  onChange={e => setNewForecast({...newForecast, probability: parseInt(e.target.value)})}
                  required
                />
                <select 
                  className="w-1/2 input-dark p-4 rounded-xl outline-none text-sm font-bold appearance-none"
                  value={newForecast.riskLevel}
                  onChange={e => setNewForecast({...newForecast, riskLevel: e.target.value as any})}
                >
                  <option value="Baixo">Risco Baixo</option>
                  <option value="Médio">Risco Médio</option>
                  <option value="Alto">Risco Alto</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full gold-gradient text-black font-black py-5 rounded-2xl shadow-xl shadow-amber-500/10 uppercase text-xs tracking-[0.25em]">
              {isEditing ? 'Salvar Alterações' : 'Publicar nos Terminais'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecasts.map(f => (
              <div key={f.id} className="p-6 glass-dark rounded-3xl border border-white/5 flex flex-col gap-4 group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">{f.league}</span>
                    <h4 className="font-black text-white text-lg tracking-tighter leading-tight mt-1">{f.match}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(f)} className="p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteForecast(f.id)} className="p-2.5 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                   <p className="text-xs font-bold text-gray-300">{f.prediction}</p>
                   <span className="text-[10px] font-black text-green-500">{f.probability}% VIP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {users.filter(u => u.role !== UserRole.ADMIN).map(u => (
            <div key={u.id} className="p-6 glass-dark rounded-[2.5rem] border border-white/5 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
              {u.isActive && <div className="absolute top-0 right-0 w-24 h-24 gold-gradient blur-[60px] opacity-10 pointer-events-none"></div>}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${u.isActive ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500'}`}>
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tighter leading-none">{u.fullName}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{u.phone}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : u.isPendingApproval ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {u.isActive ? 'Ativo' : u.isPendingApproval ? 'Pendente' : 'Inativo'}
                </div>
              </div>

              {u.isPendingApproval && u.paymentProof && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-black/40 p-6 rounded-3xl border border-white/5">
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
                    <img src={u.paymentProof} alt="Recibo" className="w-full h-40 object-contain group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Validação Inteligente</span>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${(u as any).aiValidated ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {(u as any).aiValidated ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" clipRule="evenodd"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">Dados Confirmados pela IA</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">Verificação Manual Recomendada</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApproveUser(u.id)}
                      className="w-full gold-gradient text-black font-black py-4 rounded-xl shadow-lg hover:scale-105 transition-all text-xs uppercase tracking-widest"
                    >
                      Aprovar VIP
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-4 uppercase tracking-[0.2em] font-black">
                <span>Desde: {new Date(u.createdAt).toLocaleDateString()}</span>
                {u.isActive && <span>Expira: {new Date(u.expirationDate!).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
