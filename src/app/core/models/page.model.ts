import { Pageable } from "./pageable.model";

export interface Page {
    empty?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pageable: Pageable;
    totalElements: number;
    totalPages: number;


}