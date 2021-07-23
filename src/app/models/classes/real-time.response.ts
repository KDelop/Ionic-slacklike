export class RealTimeResponse<TResponce> {
  public successful: boolean;
  public data?: TResponce; // If successful is true
  public errorData?: IError; // If successful is false
  public query?: any; // an object containing all params related to queries

  constructor() {
    //
  }

  public success(res: TResponce, query?: any): RealTimeResponse<TResponce> {
    this.successful = true;
    this.data = res;
    if (query) {
      this.query = query;
    }
    return this;
  }

  public error(res: IError, query?: any): RealTimeResponse<TResponce> {
    this.successful = false;
    this.errorData = res;
    if (query) {
      this.query = query;
    }
    return this;
  }
}

interface IError {
  name?: string;
  message?: string;
  code?: number;
  className?: string;
  stack?: string;
  data?: any;
  errors?: any;
}
