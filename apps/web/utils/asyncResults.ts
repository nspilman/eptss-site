import { AsyncResult, createSuccessResult } from '@/types/asyncResult';

export function mapAsyncResult<T, U>(
  result: AsyncResult<T>,
  mapper: (data: T) => U
): AsyncResult<U> {
  if (result.status !== 'success') {
    return result;
  }

  return createSuccessResult(mapper(result.data));
}

export function chainAsyncResult<T, U>(
  result: AsyncResult<T>,
  next: (data: T) => Promise<AsyncResult<U>>
): Promise<AsyncResult<U>> {
  if (result.status !== 'success') {
    return Promise.resolve(result as AsyncResult<U>);
  }

  return next(result.data);
}
