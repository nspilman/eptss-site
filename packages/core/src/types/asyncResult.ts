export type AsyncResultStatus = 'loading' | 'success' | 'empty' | 'error';

type SuccessResult<T> = {
  status: 'success';
  data: T;
  error?: never;
  message?: never;
};

type ErrorResult = {
  status: 'error';
  data: null;
  error: Error;
  message?: string;
};

type EmptyResult = {
  status: 'empty';
  data: null;
  error?: never;
  message?: string;
};

type LoadingResult = {
  status: 'loading';
  data: null;
  error?: never;
  message?: never;
};

export type AsyncResult<T> =
  | SuccessResult<T>
  | ErrorResult
  | EmptyResult
  | LoadingResult;

// Helper functions to create AsyncResults
export const createSuccessResult = <T>(data: T): SuccessResult<T> => ({
  status: 'success',
  data
});

export const createEmptyResult = <T>(message?: string): EmptyResult => ({
  status: 'empty',
  data: null,
  message
});

export const createErrorResult = <T>(error: Error): ErrorResult => ({
  status: 'error',
  data: null,
  error
});

export const createLoadingResult = <T>(): LoadingResult => ({
  status: 'loading',
  data: null
});
