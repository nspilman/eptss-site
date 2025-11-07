import { AsyncLocalStorage } from 'async_hooks';
import { LogContext } from '../../types';

// Create async local storage for request context
const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export function getContext(): LogContext | undefined {
  return asyncLocalStorage.getStore();
}

export function setContext(context: LogContext): void {
  const currentContext = asyncLocalStorage.getStore();
  if (currentContext) {
    Object.assign(currentContext, context);
  }
}

export function runWithContext<T>(context: LogContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

export function clearContext(): void {
  const context = asyncLocalStorage.getStore();
  if (context) {
    Object.keys(context).forEach(key => {
      delete context[key as keyof LogContext];
    });
  }
}

// Helper to generate request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
