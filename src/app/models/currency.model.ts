export namespace Currency {
  export interface Item {
    id: string;
    name: string;
    min_size: string;
  }

  export interface DataResponse {
    data: Item[];
  }
}
