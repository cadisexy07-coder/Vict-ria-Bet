
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { database } from '../services/db';

interface RegisterProps {
  onSwitch: () => void;
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch, onRegister }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const newUser = await database.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: UserRole.USER,
        isActive: false,
        expirationDate: null,
        isPendingApproval: false
      }, formData.password);

      onRegister(newUser);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar conta na base de dados.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 mb-4">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Protocolo de Inscrição</span>
        </div>
        <h2 className="text-4xl font-black mb-3 text-gray-900 tracking-tighter">Conta VIP</h2>
        <p className="text-gray-500 text-sm">Os seus dados serão processados com máxima segurança.</p>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Identidade Completa</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full input-premium rounded-2xl px-5 py-3.5 focus:outline-none"
              placeholder="Ex: João Manuel"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Contacto Telefónico</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full input-premium rounded-2xl px-5 py-3.5 focus:outline-none"
              placeholder="+244 9..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email de Acesso</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full input-premium rounded-2xl px-5 py-3.5 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Senha de Alta Segurança</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full input-premium rounded-2xl px-5 py-3.5 focus:outline-none"
              placeholder="••••••••"
            />
            <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">As senhas são encriptadas antes de serem armazenadas.</p>
          </div>
          
          <button 
            type="submit" 
            disabled={isRegistering}
            className="w-full gold-gradient font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 text-xs uppercase tracking-widest flex items-center justify-center"
          >
            {isRegistering ? 'Processando Dados...' : 'Gerar Credenciais VIP'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onSwitch} className="text-gray-400 text-xs hover:text-amber-600 transition-colors uppercase tracking-widest font-bold">
            Já possui registo? <span className="text-amber-600 underline underline-offset-4">Fazer login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
