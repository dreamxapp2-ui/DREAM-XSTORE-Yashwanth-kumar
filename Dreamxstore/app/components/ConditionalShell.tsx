'use client';

import { usePathname } from 'next/navigation';
import Header from '@/app/home/components/Header';
import { FloatingChatButton } from '@/src/screens/LandingPage/sections/FloatingChatButton/FloatingChatButton';

const AUTH_ROUTES = ['/login', '/signup', '/brand-login', '/admin/login', '/forgot-password', '/verification-link-sent'];

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));

  return (
    <>
      {!isAuthRoute && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isAuthRoute && <FloatingChatButton />}
    </>
  );
}
