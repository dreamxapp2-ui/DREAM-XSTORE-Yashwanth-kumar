'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthService from '@/src/lib/api/admin/authService';
import type { ApiError } from '@/src/lib/api/types';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AdminAuthService.login({ email, password });
      if (response.success) { router.push('/admin'); router.refresh(); }
      else setError(response.message || 'Login failed');
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'Failed to login. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: stretch; justify-content: center; background-color: #fff; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .auth-card { width: 100%; display: flex; overflow: hidden; box-shadow: none; }
        .auth-form-panel { width: 100%; background: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 24px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; min-height: 100vh; }
        .auth-form-panel::-webkit-scrollbar { display: none; }
        .auth-image-panel { display: none; position: relative; overflow: hidden; background: #111; }
        .auth-image-panel img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.1); display: block; }
        .auth-dot-overlay { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px); background-size: 4px 4px; pointer-events: none; }
        .auth-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 13px; color: #333; outline: none; box-sizing: border-box; background: #fff; transition: border-color 0.15s; }
        .auth-input:focus { border-color: #555; }
        .auth-input:disabled { background: #f5f5f5; cursor: not-allowed; }
        .auth-submit-btn { width: 100%; padding: 12px; background: #111; color: #fff; border: none; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { display: flex; gap: 14px; align-items: center; padding-top: 14px; flex-wrap: wrap; }
        .auth-footer-btn { background: none; border: none; font-size: 12px; color: #aaa; cursor: pointer; padding: 0; }
        @media (min-width: 640px) {
          .auth-page { background-color: #d1d5db; padding: 2rem; align-items: center; }
          .auth-card { max-width: 900px; min-height: auto; height: 540px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
          .auth-form-panel { width: 50%; padding: 40px 48px; min-height: auto; }
          .auth-image-panel { display: block; width: 50%; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-form-panel">
            <div>
              <div style={{ marginBottom: '36px' }}>
                <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                  <path d="M13 2L4 14H11L9 22L20 10H13L13 2Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Admin Panel</h1>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Sign in to your admin account.</p>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #fee2e2' }}>
                  {error}
                  {error.includes('Access denied') && <span style={{ display: 'block', fontSize: '11px', marginTop: '4px' }}>Only authorized admins can access this panel.</span>}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  <input id="email" type="email" required disabled={loading} placeholder="Email address" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
                  <input id="password" type="password" required disabled={loading} placeholder="Password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={loading || !email || !password} className="auth-submit-btn">
                  {loading && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '16px' }}>
                This is a restricted area. Authorized admins only.
              </p>
            </div>

            <div className="auth-footer">
              <button onClick={() => router.push('/')} className="auth-footer-btn">Home</button>
              <span style={{ color: '#ddd', fontSize: '12px' }}>/</span>
              <button onClick={() => router.push('/login')} className="auth-footer-btn">User Login</button>
            </div>
          </div>

          <div className="auth-image-panel">
            <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop" alt="Fashion" />
            <div className="auth-dot-overlay" />
          </div>
        </div>
      </div>
    </>
  );
}
