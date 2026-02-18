
import React, { useState, useEffect } from 'react';
import { User, UserRole, AuthState } from './types';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Payment from './components/Payment';
import AdminPanel from './components/AdminPanel';

const OWNER_EMAIL = 'cadisexy07@gmail.com';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    loading: true
  });
  const [view, setView] = useState<'welcome' | 'login' | 'register' | 'dashboard' | 'payment' | 'admin'>('welcome');

  useEffect(() => {
    const savedUser = localStorage.getItem('vb_user');
    if (savedUser) {
      let user = JSON.parse(savedUser) as User;
      const isOwner = user.email.toLowerCase() === OWNER_EMAIL;

      if (isOwner) {
        user.isActive = true;
        user.isPendingApproval = false;
        localStorage.setItem('vb_user', JSON.stringify(user));
      } else if (user.expirationDate && new Date(user.expirationDate) < new Date() && user.role !== UserRole.ADMIN) {
        user.isActive = false;
        localStorage.setItem('vb_user', JSON.stringify(user));
      }
      
      setAuthState({ currentUser: user, loading: false });
      
      if (user.role === UserRole.ADMIN) setView('admin');
      else if (isOwner || user.isActive || user.isPendingApproval) setView('dashboard');
      else setView('payment');
    } else {
      setAuthState({ currentUser: null, loading: false });
      setView('welcome');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vb_user');
    setAuthState({ currentUser: null, loading: false });
    setView('welcome');
  };

  const updateCurrentUser = (updated: User) => {
    const isOwner = updated.email.toLowerCase() === OWNER_EMAIL;
    const finalUser = isOwner ? { 
      ...updated, 
      isActive: true, 
      isPendingApproval: false,
      expirationDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
    } : updated;

    localStorage.setItem('vb_user', JSON.stringify(finalUser));
    setAuthState(prev => ({ ...prev, currentUser: finalUser }));
    
    if (finalUser.role === UserRole.ADMIN) setView('admin');
    else if (isOwner || finalUser.isActive || finalUser.isPendingApproval) setView('dashboard');
    else setView('payment');
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Victória Bet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {view !== 'welcome' && (
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-[100] px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => !authState.currentUser && setView('welcome')}>
              <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg">V</div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 leading-none uppercase tracking-tighter">Victória Bet</h1>
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em]">Elite Analysis</span>
              </div>
            </div>

            <nav className="flex items-center gap-6">
              {authState.currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Sair
                </button>
              ) : (
                <button 
                  onClick={() => setView('login')}
                  className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700"
                >
                  Entrar
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className={`flex-1 flex flex-col ${view === 'welcome' ? 'justify-center' : 'py-8 px-4 md:px-8'}`}>
        <div className={view === 'welcome' ? 'w-full' : 'max-w-7xl mx-auto w-full'}>
          {view === 'welcome' && <Welcome onStart={() => setView('register')} onLogin={() => setView('login')} />}
          {view === 'login' && <Login onSwitch={() => setView('register')} onLogin={updateCurrentUser} />}
          {view === 'register' && <Register onSwitch={() => setView('login')} onRegister={updateCurrentUser} />}
          {authState.currentUser && (
            <div className="animate-fade-in">
              {view === 'admin' && <AdminPanel onLogout={handleLogout} />}
              {view === 'payment' && <Payment user={authState.currentUser} onUpdateUser={updateCurrentUser} />}
              {view === 'dashboard' && <Dashboard user={authState.currentUser} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
