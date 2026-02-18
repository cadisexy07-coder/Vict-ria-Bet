
import React, { useState } from 'react';
import { User } from '../types';
import { PAYMENT_DETAILS } from '../constants';
import { database } from '../services/db';

interface PaymentProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Payment: React.FC<PaymentProps> = ({ user, onUpdateUser }) => {
  const [file, setFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFile(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    
    // Simular latência de upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedFields = { isPendingApproval: true, paymentProof: file };
    await database.updateUser(user.id, updatedFields);
    
    onUpdateUser({ ...user, ...updatedFields });
    setIsUploading(false);
  };

  if (user.isPendingApproval) {
    return (
      <div className="p-6 max-w-md mx-auto text-center mt-10 animate-fade-in">
        <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-4 tracking-tighter">Registo em Auditoria</h2>
        <p className="text-gray-500 mb-8 text-sm">O seu comprovativo está a ser processado pela nossa equipa de segurança. Receberá acesso em breve.</p>
        <div className="glass-card p-5 rounded-2xl text-left text-xs text-gray-400 bg-gray-50/50">
          <p className="font-bold text-amber-600 uppercase tracking-widest mb-2">Nota de Serviço:</p>
          <p>Tempo de validação: 30 min - 2 horas.</p>
          <p className="mt-1">Pode fechar o aplicativo com segurança.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-2 tracking-tighter">Ativar Conta VIP</h2>
        <p className="text-gray-500 text-sm">Transferência segura via Multicaixa Express.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-8 border border-amber-500/20">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400 text-xs font-bold uppercase">Subscrição 7 Dias</span>
          <span className="text-2xl font-black gold-text">{PAYMENT_DETAILS.price}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Entidade MCX</span>
            <span className="text-lg font-mono tracking-widest font-black text-gray-900">{PAYMENT_DETAILS.entidade}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Referência Direta</span>
            <span className="text-lg font-mono tracking-widest font-black text-gray-900">{PAYMENT_DETAILS.referencia}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1 text-center">Digitalizar Comprovativo</label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              required
              className="hidden" 
              id="proof-upload"
            />
            <label 
              htmlFor="proof-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] py-10 cursor-pointer hover:border-amber-500/50 transition-all bg-gray-50/30 group"
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-600 font-black text-[10px] uppercase tracking-widest">Imagem Carregada</span>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-gray-300 mb-2 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selecionar Foto</span>
                </>
              )}
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!file || isUploading}
          className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest ${!file ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'gold-gradient text-white hover:scale-[1.02]'}`}
        >
          {isUploading ? 'Validando Arquivo...' : 'Confirmar Envio VIP'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-gray-50 pt-8">
        <p className="text-[10px] text-gray-400 font-medium italic">Proteção de dados Victória Bet — Camada de segurança ativa.</p>
      </div>
    </div>
  );
};

export default Payment;
