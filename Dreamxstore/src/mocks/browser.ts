// MSW Browser Setup
import { setupWorker } from 'msw/browser';
// NOTE: Admin handlers are disabled - using real backend for admin API
// import { adminHandlers } from './handlers/adminHandlers';

// Combine all handlers
const handlers: any[] = [
  // Admin handlers disabled - connecting to real backend API at http://localhost:3000
  // ...adminHandlers,
];

// Setup worker
export const worker = setupWorker(...handlers);
