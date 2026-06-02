import { Page } from "./page.model";

export interface ClientUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface Client {
  id: number;
  user?: ClientUser;
}

export interface ClientResponse {
  content: Client[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}