
import React, { useEffect, useState } from 'react';
import { User, Forecast } from '../types';
import { getSportsAnalysis, getYesterdaysResults } from '../services/geminiService';
import { database } from '../services/db';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [history, setHistory] = useState<{league: string, match: string, result: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAnalysis, setActiveAnalysis] = useState<{ id: string, text: string, sources: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [forecastData, historyData] = await Promise.all([
          database.getForecasts(),
          getYesterdaysResults()
        ]);
        setForecasts(forecastData.slice(0, 4));
        setHistory(historyData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const calculateDaysLeft = () => {
    if (!user.expirationDate) return 0;
    const diff = new Date(user.expirationDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleShowAnalysis = async (forecast: Forecast) => {
    if (activeAnalysis?.id === forecast.id) {
      setActiveAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    const analysis = await getSportsAnalysis(forecast.match, forecast.league);
    setActiveAnalysis({ id: forecast.id, text: analysis.text, sources: analysis.sources });
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-light rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center font-black text-white text-2xl shadow-xl">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.3em] mb-1">Membro Victória Elite</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Olá, {user.fullName.split(' ')[0]}</h2>
            </div>
          </div>
          <div className="text-center md:text-right bg-slate-50 px-8 py-4 rounded-3xl border border-gray-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Validade do Plano</p>
            <div className="flex items-center gap-2 justify-center md:justify-end">
              <span className="text-3xl font-black gold-text tracking-tighter">{calculateDaysLeft()} Dias</span>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
            </div>
          </div>
        </div>
        
        <div className="glass-light rounded-[2.5rem] p-8 flex flex-col justify-center border border-gray-100 relative group">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-2">Resumo da Conta</p>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            Seu acesso expira em <span className="text-slate-900 font-bold">{new Date(user.expirationDate || '').toLocaleDateString('pt-AO')}</span>. <br/>
            <span className="text-slate-400 text-xs">Renove com antecedência para não perder as TIPS.</span>
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 gold-gradient rounded-full"></div>
              Prognósticos Exclusivos
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-5 mt-1">Atualização diária verificada</p>
          </div>
          <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl border border-gray-200 uppercase tracking-widest">
            {new Date().toLocaleDateString('pt-AO')}
          </span>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-amber-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aguarde...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forecasts.map((f, index) => (
              <div key={f.id} className="glass-light rounded-[2.5rem] overflow-hidden flex flex-col border border-gray-100 hover:border-amber-400/50 transition-all duration-300">
                <div className="p-8 flex justify-between items-start">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[8px] text-amber-500 font-black uppercase mb-0.5">TIP</span>
                      <span className="text-xl text-white font-black">0{index + 1}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 block">{f.league}</span>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">{f.match}</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${f.riskLevel === 'Baixo' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risco {f.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black gold-text leading-none mb-1">1.28</div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Odd</span>
                  </div>
                </div>

                <div className="px-8 pb-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-gray-100">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Mercado</p>
                    <p className="text-sm font-black text-slate-900">{f.prediction}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-gray-100">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Confiança</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: `${f.probability}%`}}></div>
                      </div>
                      <span className="text-sm font-black text-green-600">{f.probability}%</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 mt-auto">
                  <button 
                    onClick={() => handleShowAnalysis(f)}
                    className="w-full py-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    {isAnalyzing && activeAnalysis?.id === f.id ? 'IA Analisando...' : 'Análise Técnica'}
                  </button>

                  {activeAnalysis?.id === f.id && (
                    <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-gray-100 animate-fade-in">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{activeAnalysis.text}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-light rounded-[3rem] p-10 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Últimos Ganhos</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">SofaScore</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map((h, i) => (
            <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-gray-100 text-center">
              <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mb-2 block">{h.league}</span>
              <p className="text-base font-black text-slate-900 mb-4 tracking-tight">{h.match}</p>
              <div className="flex justify-between items-center px-2">
                 <span className="text-xl font-mono font-black text-slate-400">{h.result}</span>
                 <span className="text-[10px] font-black text-green-600 uppercase">Vencido</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
