
import React from 'react';
import { PAYMENT_DETAILS } from '../constants';

interface WelcomeProps {
  onStart: () => void;
  onLogin: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart, onLogin }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in relative z-10">
      <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full badge-gold mb-10 mx-auto backdrop-blur-md shadow-sm border border-amber-100">
        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Análises Estatísticas Desportivas</span>
      </div>

      <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter flex flex-wrap items-center justify-center gap-x-4">
        <span className="gold-text drop-shadow-[0_4px_10px_rgba(217,119,6,0.1)]">Victória</span>
        <span className="text-slate-900">Bet</span>
      </h1>

      <p className="text-slate-600 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-16 px-4">
        Prognósticos desportivos diários com análises estatísticas profissionais para decisões mais inteligentes.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <button 
          onClick={onStart}
          className="w-full md:w-auto px-12 py-6 gold-gradient rounded-[2rem] flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          Começar Agora — {PAYMENT_DETAILS.price}
        </button>
        
        <button 
          onClick={onLogin}
          className="w-full md:w-auto px-14 py-6 bg-slate-100 text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          Já tenho conta
        </button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4">
        <div className="w-px h-12 bg-slate-200"></div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Angola • Inteligência de Mercado</p>
      </div>
    </div>
  );
};

export default Welcome;
