
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      if (email === 'admin@victoriabet.ao' && password === 'admin123') {
        const admin: User = {
          id: 'admin', fullName: 'Admin Principal', email, phone: '900000000',
          role: UserRole.ADMIN, isActive: true, expirationDate: null, isPendingApproval: false
        };
        onLogin(admin);
        return;
      }
      const user = await database.validateLogin(email, password);
      if (user) onLogin(user);
      else alert('Credenciais inválidas.');
    } catch (error) {
      alert('Erro ao autenticar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in py-12 px-6">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3">Acesso VIP</h2>
        <p className="text-amber-600/60 text-[10px] font-black uppercase tracking-[0.3em]">Protocolo Victória</p>
      </div>

      <div className="glass-light p-10 rounded-[3rem] border border-gray-100 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail Elite</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full input-dark rounded-2xl px-6 py-5 outline-none placeholder-gray-400 text-sm font-bold shadow-lg"
              placeholder="seu@email.ao"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Senha</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full input-dark rounded-2xl px-6 py-5 outline-none placeholder-gray-400 text-sm font-bold shadow-lg"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={isLoggingIn}
            className="w-full gold-gradient text-white font-black py-5 rounded-2xl uppercase text-[11px] tracking-[0.25em] active:scale-95 shadow-lg"
          >
            {isLoggingIn ? 'Autenticando...' : 'Entrar Agora'}
          </button>
        </form>
        <button onClick={onSwitch} className="w-full mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-amber-600">
          Novo Membro? <span className="text-amber-600 underline font-bold">Criar Conta</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
