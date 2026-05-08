export type Role = 'USER' | 'BARBER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePhoto?: string;
}

export interface Ville{
  id?: number;
  name?: string;
}

export interface Pays{
  id?: number;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  userCentreSoinId?: number;
}
