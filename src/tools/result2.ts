interface ResultOk<T> {
  ok: true;
  data: T;
}

interface ResultError {
  ok: false;
  error: string;
}

type Result<T> = ResultOk<T> | ResultError;

function resultSuccess<T>(data: T): Result<T>;
function resultSuccess(): Result<void>;
function resultSuccess<T>(data?: T): Result<T | void> {
  return { ok: true, data: data as T | void };
}

function resultFailure(error: string): Result<never> {
  return { ok: false, error };
}

export {
  type Result,
  type ResultOk,
  type ResultError,
  resultSuccess,
  resultFailure,
};
