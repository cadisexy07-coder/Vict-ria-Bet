
import React, { useState } from 'react';
import { User } from '../types';
import { PAYMENT_DETAILS } from '../constants';
import { database } from '../services/db';
import { validateReceiptOCR } from '../services/geminiService';

interface PaymentProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Payment: React.FC<PaymentProps> = ({ user, onUpdateUser }) => {
  const [file, setFile] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{entidade?: string, referencia?: string, valor?: number, erro?: string} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setFile(base64);
        setOcrResult(null);
        
        // Iniciar OCR Automático
        setIsScanning(true);
        const result = await validateReceiptOCR(base64);
        setOcrResult(result);
        setIsScanning(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const isDataValid = () => {
    if (!ocrResult) return false;
    const cleanRef = PAYMENT_DETAILS.referencia.replace(/\s/g, '');
    const detectedRef = ocrResult.referencia?.replace(/\s/g, '');
    
    return ocrResult.entidade === PAYMENT_DETAILS.entidade && 
           detectedRef === cleanRef && 
           ocrResult.valor === 350;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    
    // Simular latência de upload final
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedFields = { 
      isPendingApproval: true, 
      paymentProof: file,
      // Passamos o status da IA para facilitar o trabalho do admin
      aiValidated: isDataValid()
    };
    
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
        <div className="glass-card p-5 rounded-2xl text-left text-xs text-gray-400 bg-gray-50/50 border border-gray-100">
          <p className="font-bold text-amber-600 uppercase tracking-widest mb-2">Nota de Serviço:</p>
          <p>Tempo de validação: 30 min - 2 horas.</p>
          <p className="mt-1">Receberá uma notificação assim que for aprovado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-2 tracking-tighter">Ativar Conta VIP</h2>
        <p className="text-gray-400 text-sm">Utilize os dados abaixo para o pagamento MCX Express.</p>
      </div>

      <div className="glass-dark rounded-3xl p-6 mb-8 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Plano Semanal (7 Dias)</span>
          <span className="text-2xl font-black gold-text">{PAYMENT_DETAILS.price}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase text-amber-500/60 font-black tracking-widest">Entidade</span>
            <span className="text-lg font-mono tracking-widest font-black text-white">{PAYMENT_DETAILS.entidade}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase text-amber-500/60 font-black tracking-widest">Referência</span>
            <span className="text-lg font-mono tracking-widest font-black text-white">{PAYMENT_DETAILS.referencia}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">Upload do Comprovativo</label>
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
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] py-10 cursor-pointer transition-all bg-white/5 group ${file ? 'border-green-500/50' : 'border-white/10 hover:border-amber-500/50'}`}
            >
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Lendo Dados com IA...</span>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-500 font-black text-[10px] uppercase tracking-widest">Imagem Carregada</span>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-gray-600 mb-2 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tirar Foto ou Galeria</span>
                </>
              )}
            </label>
          </div>
        </div>

        {ocrResult && !isScanning && (
          <div className={`p-4 rounded-2xl border animate-fade-in ${ocrResult.erro ? 'bg-red-500/5 border-red-500/20' : isDataValid() ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-4 h-4 ${ocrResult.erro ? 'text-red-500' : isDataValid() ? 'text-green-500' : 'text-amber-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Verificação de IA</span>
            </div>
            {ocrResult.erro ? (
              <p className="text-[10px] text-red-400 font-medium">{ocrResult.erro}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="text-gray-500">Entidade: <span className={ocrResult.entidade === PAYMENT_DETAILS.entidade ? 'text-green-500' : 'text-red-400'}>{ocrResult.entidade}</span></div>
                <div className="text-gray-500">Valor: <span className={ocrResult.valor === 350 ? 'text-green-500' : 'text-red-400'}>{ocrResult.valor} Kz</span></div>
                <div className="text-gray-500 col-span-2">Referência: <span className={ocrResult.referencia?.replace(/\s/g, '') === PAYMENT_DETAILS.referencia.replace(/\s/g, '') ? 'text-green-500' : 'text-red-400'}>{ocrResult.referencia}</span></div>
              </div>
            )}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file || isUploading || isScanning}
          className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest ${(!file || isScanning) ? 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5' : 'gold-gradient text-black hover:scale-[1.02]'}`}
        >
          {isUploading ? 'Finalizando Envio...' : 'Enviar para Aprovação'}
        </button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-[0.2em] leading-relaxed">
          O uso de comprovativos falsos resultará no banimento permanente da conta sem direito a reembolso.
        </p>
      </div>
    </div>
  );
};

export default Payment;
