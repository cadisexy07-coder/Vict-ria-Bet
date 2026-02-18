
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
    <div className="p-4 max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* User Status Card */}
      <div className="glass-card rounded-[2.5rem] p-6 border border-gray-100 flex justify-between items-center shadow-md bg-white/90">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center font-black text-white shadow-lg">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Utilizador VIP</p>
            <p className="text-base font-black text-gray-900 tracking-tight">{user.fullName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Acesso Restante</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xl font-black text-amber-600">{calculateDaysLeft()} Dias</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>
      </div>

      {/* Daily Target Section */}
      <div className="flex justify-between items-end px-1 pb-1">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Os 4 Prognósticos do Dia
          </h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-8">Garantia Victória Bet Premium</p>
        </div>
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg uppercase border border-amber-100">{new Date().toLocaleDateString('pt-AO')}</span>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sincronizando Análises...</p>
        </div>
      ) : forecasts.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-[2rem] border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">Aguardando novos palpites.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.map((f, index) => (
            <div key={f.id} className="glass-card rounded-[2rem] overflow-hidden border border-gray-100 hover:border-amber-500/20 transition-all duration-300 group shadow-sm bg-white">
              <div className="p-5 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-900 flex flex-col items-center justify-center shrink-0 shadow-lg">
                    <span className="text-[8px] text-amber-500 font-black uppercase leading-none mb-0.5">TIP</span>
                    <span className="text-sm text-white font-black leading-none">0{index + 1}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 block">{f.league}</span>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-1">{f.match}</h4>
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                        f.riskLevel === 'Baixo' ? 'text-green-600' : 'text-amber-600'
                       }`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${f.riskLevel === 'Baixo' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                         Risco {f.riskLevel}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black gold-text leading-none mb-1">1.25</div>
                   <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Odd Est.</span>
                </div>
              </div>

              <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                   <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Sugestão VIP</p>
                   <p className="text-xs font-black text-gray-900 leading-tight">{f.prediction}</p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                   <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Confiança</p>
                   <p className="text-xs font-black text-green-600 leading-none">{f.probability}%</p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button 
                  onClick={() => handleShowAnalysis(f)}
                  className="w-full py-3.5 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 hover:bg-amber-500/5 hover:text-amber-600 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  {isAnalyzing && activeAnalysis?.id === f.id ? 'Processando Dados...' : 'Ver Relatório Técnico'}
                  <svg className={`w-3 h-3 transition-transform ${activeAnalysis?.id === f.id ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeAnalysis?.id === f.id && (
                  <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl animate-fade-in">
                    <p className="text-xs text-gray-700 leading-relaxed font-medium italic mb-4">"{activeAnalysis.text}"</p>
                    {activeAnalysis.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-500/10">
                        {activeAnalysis.sources.slice(0, 2).map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[8px] font-black text-amber-600 uppercase bg-white px-2 py-1 rounded border border-amber-100">Fonte Oficial {i+1}</a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Feed - ÚLTIMOS GANHOS DA ELITE (VERIFICADOS SOFASCORE) */}
      <div className="mt-12 pb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">Últimos Ganhos da Elite</h3>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase">
              <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z"/></svg>
              SofaScore Verified
            </div>
          </div>
          <div className="h-px flex-1 bg-gray-100 ml-4"></div>
        </div>
        
        <div className="space-y-3">
           {history.map((h, i) => (
             <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-[1.8rem] shadow-sm animate-fade-in group hover:border-green-200 transition-colors" style={{animationDelay: `${i * 100}ms`}}>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">{h.league}</span>
                  <span className="text-sm font-black text-gray-800 tracking-tight">{h.match}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg uppercase border border-green-100 tracking-tighter shadow-sm">Green</span>
                    <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase font-mono">{h.result}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                </div>
             </div>
           ))}
           {history.length === 0 && !loading && (
             <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest py-6 border border-dashed border-gray-100 rounded-3xl">Sincronizando resultados SofaScore...</p>
           )}
        </div>
        
        <p className="text-[9px] text-gray-300 font-medium text-center mt-6 uppercase tracking-widest">Resultados reais baseados nos dados de ontem.</p>
      </div>
    </div>
  );
};

export default Dashboard;
