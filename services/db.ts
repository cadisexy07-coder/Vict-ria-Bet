
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, DBUser, Forecast } from '../types';

const OWNER_EMAIL = 'cadisexy07@gmail.com';

const getSupabaseClient = (): SupabaseClient | null => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Victória Bet: Operando em modo de fallback.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    return null;
  }
};

const supabase = getSupabaseClient();

const hashPassword = (password: string): string => {
  return btoa(`vb_salt_${password}_security_plus`);
};

const LOCAL_USERS_KEY = 'vb_fallback_users';
const LOCAL_FORECASTS_KEY = 'vb_fallback_forecasts';

const SEED_FORECASTS: Forecast[] = [
  {
    id: 'tip-01',
    league: 'Champions League',
    match: 'Qarabag vs Newcastle',
    prediction: 'Mais de 1.5 Golos',
    probability: 88,
    riskLevel: 'Baixo',
    analysis: 'Tendência ofensiva forte de ambas as equipas.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-02',
    league: 'Champions League',
    match: 'Olympiacos vs Leverkusen',
    prediction: 'Leverkusen: Mais de 0.5 Golos',
    probability: 92,
    riskLevel: 'Baixo',
    analysis: 'Leverkusen em forma excepcional nesta temporada.',
    createdAt: new Date().toISOString()
  }
];

export const database = {
  _getLocalUsers(): DBUser[] {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  _saveLocalUsers(users: DBUser[]) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  },

  _getLocalForecasts(): Forecast[] {
    const data = localStorage.getItem(LOCAL_FORECASTS_KEY);
    if (!data) {
      this._saveLocalForecasts(SEED_FORECASTS);
      return SEED_FORECASTS;
    }
    return JSON.parse(data);
  },

  _saveLocalForecasts(forecasts: Forecast[]) {
    localStorage.setItem(LOCAL_FORECASTS_KEY, JSON.stringify(forecasts));
  },

  // Função interna para aplicar privilégios de proprietário
  _applyOwnerPrivileges(user: DBUser | User): any {
    if (user.email.toLowerCase() === OWNER_EMAIL) {
      return {
        ...user,
        isActive: true,
        isPendingApproval: false,
        expirationDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // 100 anos
      };
    }
    return user;
  },

  async getUsers(): Promise<DBUser[]> {
    if (!supabase) return this._getLocalUsers();
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) return this._getLocalUsers();
    return (data || []).map((u: any) => this._applyOwnerPrivileges({
      id: u.id, fullName: u.full_name, email: u.email, phone: u.phone, role: u.role,
      isActive: u.is_active, expirationDate: u.expiration_date, paymentProof: u.payment_proof,
      isPendingApproval: u.is_pending_approval, passwordHash: u.password_hash, createdAt: u.created_at
    }));
  },

  async findUserByEmail(email: string): Promise<DBUser | undefined> {
    const emailLower = email.toLowerCase();
    if (!supabase) {
      const user = this._getLocalUsers().find(u => u.email.toLowerCase() === emailLower);
      return user ? this._applyOwnerPrivileges(user) : undefined;
    }
    const { data, error } = await supabase.from('users').select('*').eq('email', emailLower).single();
    if (error && error.code !== 'PGRST116') return this._getLocalUsers().find(u => u.email.toLowerCase() === emailLower);
    if (!data) return undefined;
    return this._applyOwnerPrivileges({
      id: data.id, fullName: data.full_name, email: data.email, phone: data.phone, role: data.role,
      isActive: data.is_active, expirationDate: data.expiration_date, paymentProof: data.payment_proof,
      isPendingApproval: data.is_pending_approval, password_hash: data.password_hash, created_at: data.created_at
    } as any);
  },

  async createUser(userData: Omit<DBUser, 'id' | 'passwordHash' | 'createdAt'>, password: string): Promise<User> {
    // Verificar se é o proprietário Ricardo Soares
    let finalUserData = { ...userData };
    if (finalUserData.email.toLowerCase() === OWNER_EMAIL) {
      finalUserData.isActive = true;
      finalUserData.expirationDate = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (!supabase) {
      const users = this._getLocalUsers();
      if (users.find(u => u.email === finalUserData.email)) throw new Error("Email já existe.");
      const newUser: DBUser = {
        ...finalUserData, id: Math.random().toString(36).substr(2, 9),
        passwordHash: hashPassword(password), createdAt: new Date().toISOString()
      };
      users.push(newUser);
      this._saveLocalUsers(users);
      const { passwordHash, ...sessionUser } = newUser;
      return sessionUser;
    }
    
    const emailExists = await this.findUserByEmail(finalUserData.email);
    if (emailExists) throw new Error("Este email já está registado.");
    
    const { data, error } = await supabase.from('users').insert([{
      full_name: finalUserData.fullName, email: finalUserData.email.toLowerCase(), phone: finalUserData.phone,
      role: finalUserData.role, is_active: finalUserData.isActive, expiration_date: finalUserData.expirationDate,
      is_pending_approval: finalUserData.isPendingApproval, password_hash: hashPassword(password),
      created_at: new Date().toISOString()
    }]).select().single();
    
    if (error) throw new Error("Falha no servidor.");
    return this._applyOwnerPrivileges({ 
      id: data.id, fullName: data.full_name, email: data.email, phone: data.phone, 
      role: data.role, isActive: data.is_active, expirationDate: data.expiration_date, 
      isPendingApproval: data.is_pending_approval 
    });
  },

  async validateLogin(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (user && user.passwordHash === hashPassword(password)) {
      const { passwordHash, ...sessionUser } = user;
      return this._applyOwnerPrivileges(sessionUser);
    }
    return null;
  },

  async updateUser(userId: string, updates: any): Promise<void> {
    if (!supabase) {
      const users = this._getLocalUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        this._saveLocalUsers(users);
      }
      return;
    }
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;
    if (updates.isPendingApproval !== undefined) dbUpdates.is_pending_approval = updates.isPendingApproval;
    if (updates.paymentProof !== undefined) dbUpdates.payment_proof = updates.paymentProof;
    const { error } = await supabase.from('users').update(dbUpdates).eq('id', userId);
    if (error) throw new Error("Falha ao atualizar dados.");
  },

  async getForecasts(): Promise<Forecast[]> {
    if (!supabase) return this._getLocalForecasts();
    const { data, error } = await supabase.from('forecasts').select('*').order('created_at', { ascending: false });
    if (error) return this._getLocalForecasts();
    return (data || []).map((f: any) => ({ ...f, createdAt: f.created_at })) as Forecast[];
  },

  async saveForecast(forecast: Omit<Forecast, 'id'>): Promise<void> {
    if (!supabase) {
      const forecasts = this._getLocalForecasts();
      const newF = { ...forecast, id: Math.random().toString(36).substr(2, 9) } as Forecast;
      forecasts.unshift(newF);
      this._saveLocalForecasts(forecasts);
      return;
    }
    const { createdAt, ...otherData } = forecast;
    const { error } = await supabase.from('forecasts').insert([{ ...otherData, created_at: createdAt }]);
    if (error) throw new Error("Falha ao guardar prognóstico.");
  },

  async updateForecast(id: string, updates: Partial<Forecast>): Promise<void> {
    if (!supabase) {
      const forecasts = this._getLocalForecasts();
      const index = forecasts.findIndex(f => f.id === id);
      if (index !== -1) {
        forecasts[index] = { ...forecasts[index], ...updates };
        this._saveLocalForecasts(forecasts);
      }
      return;
    }
    const { createdAt, ...otherUpdates } = updates;
    const dbUpdates: any = { ...otherUpdates };
    if (createdAt) dbUpdates.created_at = createdAt;
    const { error } = await supabase.from('forecasts').update(dbUpdates).eq('id', id);
    if (error) throw new Error("Falha ao atualizar prognóstico.");
  },

  async deleteForecast(id: string): Promise<void> {
    if (!supabase) {
      const forecasts = this._getLocalForecasts();
      const filtered = forecasts.filter(f => f.id !== id);
      this._saveLocalForecasts(filtered);
      return;
    }
    const { error } = await supabase.from('forecasts').delete().eq('id', id);
    if (error) throw new Error("Falha ao eliminar prognóstico.");
  }
};
