
import React, { useState, useEffect } from 'react';
import { User, UserRole, Forecast, AuthState } from './types';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Payment from './components/Payment';
import AdminPanel from './components/AdminPanel';
import { APP_INFO } from './constants';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    loading: true
  });
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'payment' | 'admin'>('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('vb_user');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      if (user.expirationDate && new Date(user.expirationDate) < new Date() && user.role !== UserRole.ADMIN) {
        user.isActive = false;
        localStorage.setItem('vb_user', JSON.stringify(user));
      }
      setAuthState({ currentUser: user, loading: false });
      
      if (user.role === UserRole.ADMIN) setView('admin');
      else if (!user.isActive && !user.isPendingApproval) setView('payment');
      else setView('dashboard');
    } else {
      setAuthState({ currentUser: null, loading: false });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vb_user');
    setAuthState({ currentUser: null, loading: false });
    setView('login');
  };

  const updateCurrentUser = (updated: User) => {
    localStorage.setItem('vb_user', JSON.stringify(updated));
    setAuthState(prev => ({ ...prev, currentUser: updated }));
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 flex flex-col">
      {/* App Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-sm">V</div>
          <h1 className="text-xl font-black gold-text uppercase tracking-tighter">Victória Bet</h1>
        </div>
        {authState.currentUser && (
          <button 
            onClick={handleLogout}
            className="text-xs text-gray-500 font-bold hover:text-amber-600 transition-colors uppercase tracking-widest"
          >
            Sair
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        {!authState.currentUser ? (
          view === 'login' ? (
            <Login onSwitch={() => setView('register')} onLogin={updateCurrentUser} />
          ) : (
            <Register onSwitch={() => setView('login')} onRegister={updateCurrentUser} />
          )
        ) : (
          <>
            {authState.currentUser.role === UserRole.ADMIN ? (
              <AdminPanel onLogout={handleLogout} />
            ) : (
              <>
                {(!authState.currentUser.isActive && !authState.currentUser.isPendingApproval) ? (
                  <Payment user={authState.currentUser} onUpdateUser={updateCurrentUser} />
                ) : (
                  <Dashboard user={authState.currentUser} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center text-[10px] text-gray-400 border-t border-gray-50 bg-gray-50/30">
        <p className="mb-1">{APP_INFO.responsibleGaming}</p>
        <p className="font-medium">&copy; 2024 Victória Bet. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
