
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { database } from '../services/db';

interface RegisterProps {
  onSwitch: () => void;
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch, onRegister }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const newUser = await database.createUser({
        fullName: formData.fullName, email: formData.email, phone: formData.phone,
        role: UserRole.USER, isActive: false, expirationDate: null, isPendingApproval: false
      }, formData.password);
      onRegister(newUser);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar conta.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in py-12 px-6">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3">Novo Membro Elite</h2>
        <p className="text-amber-600/60 text-[10px] font-black uppercase tracking-[0.3em]">Inscrição em Protocolo VIP</p>
      </div>

      <div className="glass-light p-10 rounded-[3rem] shadow-2xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="text" required placeholder="Nome Completo"
            className="w-full input-dark rounded-2xl px-6 py-5 outline-none text-white text-sm font-bold shadow-lg"
            value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <input 
            type="tel" required placeholder="Telefone (+244)"
            className="w-full input-dark rounded-2xl px-6 py-5 outline-none text-white text-sm font-bold shadow-lg"
            value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input 
            type="email" required placeholder="E-mail de Acesso"
            className="w-full input-dark rounded-2xl px-6 py-5 outline-none text-white text-sm font-bold shadow-lg"
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" required placeholder="Senha de Segurança"
            className="w-full input-dark rounded-2xl px-6 py-5 outline-none text-white text-sm font-bold shadow-lg"
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button 
            type="submit" disabled={isRegistering}
            className="w-full gold-gradient text-white font-black py-5 rounded-2xl uppercase text-[11px] tracking-[0.25em] transition-transform active:scale-95 shadow-xl mt-4"
          >
            {isRegistering ? 'Processando...' : 'Criar Conta VIP'}
          </button>
        </form>
        <button onClick={onSwitch} className="w-full mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-amber-600 transition-colors">
          Já é membro? <span className="text-amber-600 underline font-bold">Fazer Login</span>
        </button>
      </div>
    </div>
  );
};

export default Register;
