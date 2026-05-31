import { CentreSoin } from "./centre-soin.model";
import { Page } from "./page.model";
import { User } from "./user.model";

export interface Client {
  id: number;
  user?: User;
  centreSoin?: CentreSoin;
}


export interface ClientResponse {
  content: Client[];
  page: Page;
}