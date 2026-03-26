import React, { useState } from "react";
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/config';
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = { email: string; password: string };
type ErrorState = Partial<Record<keyof LoginFormData | "general", string>>;

export const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = (token: string, user: { id: string; username: string; email: string; isBrand?: boolean }) => {
    localStorage.setItem("dreamx_user", JSON.stringify({
      username: user.username, email: user.email, isBrand: user.isBrand,
      avatarUrl: undefined, token,
    }));
    window.dispatchEvent(new Event("storage"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      loginSchema.parse(formData);
      const data = await apiClient.post('/auth/login', { email: formData.email, password: formData.password });
      if (data.token) localStorage.setItem("token", data.token);
      login(data.token, { id: data.user.id, username: data.user.username, email: data.user.email, isBrand: data.user.isBrand });
      router.push("/");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: ErrorState = {};
        err.issues.forEach((e) => { const f = e.path[0] as keyof LoginFormData; fieldErrors[f] = e.message; });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message || "An error occurred during login" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const productionUrl = 'https://dreamx-store.onrender.com';
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? productionUrl : 'http://localhost:3000');
    const authUrl = rawApiUrl.replace(/\/api$/, "");
    window.location.href = `${authUrl}/api${ENDPOINTS.GOOGLE_AUTH}`;
  };

  return (
    <>
      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: stretch; justify-content: center; background-color: #fff; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .auth-card { width: 100%; display: flex; overflow: hidden; box-shadow: none; min-height: 100vh; }
        .auth-form-panel { width: 100%; background: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 24px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .auth-form-panel::-webkit-scrollbar { display: none; }
        .auth-image-panel { display: none; position: relative; overflow: hidden; background: #111; }
        .auth-image-panel img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.1); display: block; }
        .auth-dot-overlay { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px); background-size: 4px 4px; pointer-events: none; }
        .auth-social-btns { display: flex; gap: 10px; margin-bottom: 16px; }
        .auth-social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 8px; border: 1.5px solid #e0e0e0; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 500; color: #333; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .auth-social-btn:hover { background: #f9f9f9; }
        .auth-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 13px; color: #333; outline: none; box-sizing: border-box; background: #fff; transition: border-color 0.15s; }
        .auth-input:focus { border-color: #555; }
        .auth-submit-btn { width: 100%; padding: 12px; background: #111; color: #fff; border: none; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; letter-spacing: 0.01em; }
        .auth-submit-btn:hover { opacity: 0.85; }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .auth-divider-line { flex: 1; height: 1px; background: #e8e8e8; }
        .auth-divider-text { font-size: 12px; color: #aaa; font-weight: 500; }
        .auth-footer { display: flex; gap: 16px; align-items: center; padding-top: 16px; flex-wrap: wrap; }
        .auth-footer-btn { background: none; border: none; font-size: 12px; color: #aaa; cursor: pointer; padding: 0; }
        .auth-footer-sep { color: #ddd; font-size: 12px; }
        .auth-error { padding: 10px 14px; background: #fef2f2; color: #dc2626; font-size: 12px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #fee2e2; }
        .auth-field-err { font-size: 11px; color: #dc2626; margin-top: 4px; display: block; }
        @media (min-width: 640px) {
          .auth-page { background-color: #d1d5db; padding: 2rem; align-items: center; }
          .auth-card { max-width: 900px; height: 580px; min-height: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
          .auth-form-panel { width: 50%; padding: 40px 48px; }
          .auth-image-panel { display: block; width: 50%; }
          .auth-social-btn { font-size: 13px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          {/* LEFT — Form */}
          <div className="auth-form-panel">
            <div>
              {/* Logo */}
              <div style={{ marginBottom: '36px' }}>
                <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                  <path d="M13 2L4 14H11L9 22L20 10H13L13 2Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Heading */}
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome back!</h1>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Your work, your team, your flow — all in one place.</p>
              </div>

              {/* Social */}
              <div className="auth-social-btns">
                <button onClick={handleGoogleLogin} className="auth-social-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign In with Google
                </button>
                <button className="auth-social-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="black">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Sign In with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">Or</span>
                <div className="auth-divider-line" />
              </div>

              {errors.general && <div className="auth-error">{errors.general}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <input type="email" placeholder="Enter your email" className="auth-input"
                    value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} />
                  {errors.email && <span className="auth-field-err">{errors.email}</span>}
                </div>
                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Signing in...' : 'Sign in with email'}
                </button>
              </form>

              {/* Links */}
              <p style={{ textAlign: 'center', fontSize: '12.5px', color: '#888', marginTop: '14px' }}>
                Don&apos;t have an account?{' '}
                <button onClick={() => router.push('/signup')}
                  style={{ background: 'none', border: 'none', color: '#111', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  Sign Up
                </button>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                <button onClick={() => router.push('/brand-login')}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  Brand Login
                </button>
                <span style={{ color: '#ddd', fontSize: '12px' }}>|</span>
                <button onClick={() => router.push('/admin/login')}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: '#888', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  Admin Login
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="auth-footer">
              <button onClick={() => router.push('/help')} className="auth-footer-btn">Help</button>
              <span className="auth-footer-sep">/</span>
              <button onClick={() => router.push('/terms')} className="auth-footer-btn">Terms</button>
              <span className="auth-footer-sep">/</span>
              <button onClick={() => router.push('/privacy')} className="auth-footer-btn">Privacy</button>
            </div>
          </div>

          {/* RIGHT — B&W Image (hidden on mobile) */}
          <div className="auth-image-panel">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop" alt="Fashion" />
            <div className="auth-dot-overlay" />
          </div>
        </div>
      </div>
    </>
  );
};
