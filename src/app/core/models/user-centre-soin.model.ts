import { CentreSoin } from "./centre-soin.model";
import { User } from "./user.model";

export interface UserCentreSoin {
  id: number;
  user?: User;
  centreSoin?: CentreSoin;
  address?: string;
}
