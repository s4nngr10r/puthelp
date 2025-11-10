export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: Role[];
  kierunek?: Kierunek;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  description: string;
}

export interface Kierunek {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  kierunekId?: number;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
