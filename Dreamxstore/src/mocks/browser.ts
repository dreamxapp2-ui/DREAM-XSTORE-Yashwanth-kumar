// MSW Browser Setup
import { setupWorker } from 'msw/browser';
import { adminHandlers } from './handlers/adminHandlers';

// Combine all handlers
const handlers: any[] = [
  // Admin handlers enabled to resolve 403 errors on dashboard
  ...adminHandlers,
];

// Setup worker
export const worker = setupWorker(...handlers);
