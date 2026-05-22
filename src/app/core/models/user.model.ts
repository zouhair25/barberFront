import { UserCentreSoin } from "./user-centre-soin.model";

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
  id: number;
  name: string;
}

export interface Pays{
  id?: number;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export interface RegisterCompleteRequest {
  shopName: string;
  adresse: string;
  ville: string;
  villeId: number;
  fix?: string;
  latitude?: string;
  longitude?: string;
  userId: number;
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
  userCentreSoins?: UserCentreSoin[];
}
