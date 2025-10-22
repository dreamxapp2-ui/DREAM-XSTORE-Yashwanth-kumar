/**
 * @deprecated This file is no longer used.
 * 
 * The application has been migrated from React Router to Next.js App Router.
 * 
 * New entry point: /app/layout.tsx and /app/page.tsx
 * Routing is now handled by Next.js App Router in the /app directory.
 * 
 * All routes have been converted:
 * - React Router <Route> components → Next.js /app directory structure
 * - useNavigate() → useRouter() from 'next/navigation'
 * - <Link to=""> → <Link href=""> from 'next/link'
 * 
 * This file can be safely deleted.
 */

// This file is kept for reference only and is not used in the application.
export default function DeprecatedApp() {
  throw new Error(
    'This App component is deprecated. The application now uses Next.js App Router. ' +
    'Entry point is /app/layout.tsx and /app/page.tsx'
  );
}