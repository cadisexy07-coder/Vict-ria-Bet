
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  expirationDate: string | null;
  paymentProof?: string;
  isPendingApproval: boolean;
}

// Representação do utilizador na base de dados (com campos sensíveis)
export interface DBUser extends User {
  passwordHash: string;
  createdAt: string;
}

export interface Forecast {
  id: string;
  league: string;
  match: string;
  prediction: string;
  probability: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  analysis: string;
  createdAt: string;
  result?: 'Win' | 'Loss' | 'Pending';
}

export interface AuthState {
  currentUser: User | null;
  loading: boolean;
}
