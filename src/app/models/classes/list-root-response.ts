import { IListRootResponse } from '..';

export class ListRootResponse<TResponce> implements IListRootResponse<TResponce> {
  public total: number;
  public limit: number;
  public skip: number;
  public data: TResponce[];
}
