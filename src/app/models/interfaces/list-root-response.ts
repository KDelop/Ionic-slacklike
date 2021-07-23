export interface IListRootResponse<TResponce> {
  total: number;
  limit: number;
  skip: number;
  data: TResponce[];
}
