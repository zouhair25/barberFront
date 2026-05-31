export interface Pageable{
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: boolean;
}

export interface Sort{
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}