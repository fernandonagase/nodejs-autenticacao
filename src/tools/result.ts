export class Result<T> {
  ok: boolean;
  data?: T;
  error?: string;

  constructor(ok: boolean, data?: T, error?: string) {
    this.ok = ok;
    this.data = data;
    this.error = error;
  }

  static success<T>(data?: T): Result<T> {
    return new Result<T>(true, data);
  }

  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }
}
