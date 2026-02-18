
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { database } from '../services/db';

interface LoginProps {
  onSwitch: () => void;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const freeTips = [
    { id: 'f1', match: 'Bayern Munique vs PSG', league: 'Champions League', tip: 'Vitória Casa' },
    { id: 'f2', match: 'Barcelona vs Atl. Madrid', league: 'La Liga', tip: 'Ambas Marcam' },
    { id: 'f3', match: 'Liverpool vs Man. United', league: 'Premier League', tip: 'Mais 2.5 Golos' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Admin Mock (Ainda hardcoded para conveniência do teste, mas poderia ir para a DB)
      if (email === 'admin@victoriabet.ao' && password === 'admin123') {
        const admin: User = {
          id: 'admin',
          fullName: 'Administrador Principal',
          email: email,
          phone: '900000000',
          role: UserRole.ADMIN,
          isActive: true,
          expirationDate: null,
          isPendingApproval: false
        };
        onLogin(admin);
        return;
      }

      const user = await database.validateLogin(email, password);
      
      if (user) {
        onLogin(user);
      } else {
        alert('As credenciais não coincidem com os nossos registos de segurança.');
      }
    } catch (error) {
      alert('Erro ao aceder à base de dados.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-8 animate-fade-in relative">
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 mb-5">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.25em]">Canais de Dados Seguros</span>
        </div>
        <h2 className="text-4xl font-black mb-3 text-gray-900 tracking-tighter">Victória Bet</h2>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          Segurança e precisão em cada <br/> análise estatística.
        </p>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border border-gray-100 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Email Registado</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-premium rounded-2xl px-6 py-4.5 focus:outline-none placeholder-gray-300 font-medium"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Senha Encriptada</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full input-premium rounded-2xl px-6 py-4.5 focus:outline-none placeholder-gray-300 font-medium"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full gold-gradient font-black py-5 rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all mt-4 text-xs uppercase tracking-[0.2em] flex items-center justify-center"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verificando...
              </span>
            ) : 'Autenticar Acesso'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-gray-50 pt-8">
          <p className="text-gray-400 text-xs mb-3">Não possui uma conta segura?</p>
          <button onClick={onSwitch} className="text-amber-600 text-xs font-bold hover:text-amber-700 transition-colors flex items-center justify-center gap-2 mx-auto group">
            <span className="underline underline-offset-8 decoration-amber-500/30 uppercase tracking-widest">Registar Novo Utilizador</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-16 animate-fade-in">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Destaques Públicos</h3>
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        
        <div className="space-y-3">
          {freeTips.map((tip) => (
            <div key={tip.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-amber-200 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{tip.league}</span>
                <span className="text-xs font-bold text-gray-800">{tip.match}</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-md mb-1">{tip.tip}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-gray-300 font-bold uppercase tracking-tighter italic">Bloqueado</span>
                  <svg className="w-2.5 h-2.5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-12 text-center pb-10">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
          Victória Bet — Infraestrutura de dados premium.
        </p>
      </div>
    </div>
  );
};

export default Login;
