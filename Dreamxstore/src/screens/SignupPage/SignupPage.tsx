import React, { useState } from "react";
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/config';
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  username: z.string().min(3, "Min 3 characters").max(20, "Max 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers & underscores only"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Min 8 characters")
    .regex(/^(?=.*[a-z])/, "Must include lowercase")
    .regex(/^(?=.*[A-Z])/, "Must include uppercase")
    .regex(/^(?=.*\d)/, "Must include a number")
    .regex(/^(?=.*[@$!%*?&#\-_.,;:()[\]{}'\"<>~`+=|\\\/])/, "Must include a special character"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type SignupFormData = z.infer<typeof signupSchema>;
type ErrorState = Partial<Record<keyof SignupFormData | 'general', string>>;

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<ErrorState>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setLoading(true);
    try {
      const v = signupSchema.parse(formData);
      const data = await apiClient.post(ENDPOINTS.SIGNUP, { username: v.username, email: v.email, password: v.password });
      if (data.user) localStorage.setItem("pendingUser", JSON.stringify(data.user));
      localStorage.setItem("pendingVerificationEmail", v.email);
      router.push("/verification-link-sent");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fe: Partial<Record<keyof SignupFormData, string>> = {};
        err.issues.forEach((e) => { fe[e.path[0] as keyof SignupFormData] = e.message; });
        setErrors(fe);
      } else { setGlobalError(err.message || "An error occurred during signup"); }
    } finally { setLoading(false); }
  };

  const handleGoogleSignup = () => {
    const productionUrl = 'https://dreamx-store.onrender.com';
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? productionUrl : 'http://localhost:3000');
    window.location.href = `${rawApiUrl.replace(/\/api$/, "")}/api${ENDPOINTS.GOOGLE_AUTH}`;
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
        .auth-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 13px; color: #333; outline: none; box-sizing: border-box; background: #fff; transition: border-color 0.15s; }
        .auth-input:focus { border-color: #555; }
        .auth-submit-btn { width: 100%; padding: 12px; background: #111; color: #fff; border: none; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .auth-submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .auth-divider-line { flex: 1; height: 1px; background: #e8e8e8; }
        .auth-divider-text { font-size: 12px; color: #aaa; }
        .auth-footer { display: flex; gap: 14px; align-items: center; padding-top: 14px; flex-wrap: wrap; }
        .auth-footer-btn { background: none; border: none; font-size: 12px; color: #aaa; cursor: pointer; padding: 0; }
        .auth-footer-sep { color: #ddd; font-size: 12px; }
        .auth-field-err { font-size: 11px; color: #dc2626; margin-top: 3px; display: block; }
        .auth-pw-wrap { position: relative; }
        .auth-pw-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #aaa; padding: 0; display: flex; align-items: center; }
        @media (min-width: 640px) {
          .auth-page { background-color: #d1d5db; padding: 2rem; align-items: center; }
          .auth-card { max-width: 900px; min-height: auto; height: 620px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
          .auth-form-panel { width: 50%; padding: 36px 48px; min-height: auto; }
          .auth-image-panel { display: block; width: 50%; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          {/* LEFT — Form */}
          <div className="auth-form-panel">
            <div>
              {/* Logo */}
              <div style={{ marginBottom: '28px' }}>
                <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                  <path d="M13 2L4 14H11L9 22L20 10H13L13 2Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: '0 0 5px', letterSpacing: '-0.5px' }}>Create account</h1>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Join DreamXStore — your style, your world.</p>
              </div>

              {/* Google */}
              <button onClick={handleGoogleSignup} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#333', cursor: 'pointer', marginBottom: '14px', boxSizing: 'border-box' as const }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">Or</span>
                <div className="auth-divider-line" />
              </div>

              {globalError && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #fee2e2' }}>{globalError}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <input type="text" placeholder="Username" className="auth-input" value={formData.username}
                      onChange={e => setFormData(f => ({ ...f, username: e.target.value }))} />
                    {errors.username && <span className="auth-field-err">{errors.username}</span>}
                  </div>
                  <div>
                    <input type="email" placeholder="Enter your email" className="auth-input" value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    {errors.email && <span className="auth-field-err">{errors.email}</span>}
                  </div>
                  <div className="auth-pw-wrap">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" className="auth-input" style={{ paddingRight: '36px' }} value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {errors.password && <span className="auth-field-err">{errors.password}</span>}
                  </div>
                  <div className="auth-pw-wrap">
                    <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" className="auth-input" style={{ paddingRight: '36px' }} value={formData.confirmPassword}
                      onChange={e => setFormData(f => ({ ...f, confirmPassword: e.target.value }))} />
                    <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {errors.confirmPassword && <span className="auth-field-err">{errors.confirmPassword}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input type="checkbox" id="terms" required style={{ width: '14px', height: '14px', cursor: 'pointer', flexShrink: 0 }} />
                  <label htmlFor="terms" style={{ fontSize: '12px', color: '#888', cursor: 'pointer' }}>I agree to the Terms &amp; Conditions</label>
                </div>
                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '12.5px', color: '#888', marginTop: '14px', marginBottom: 0 }}>
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#111', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  Sign In
                </button>
              </p>
            </div>

            <div className="auth-footer">
              <button onClick={() => router.push('/help')} className="auth-footer-btn">Help</button>
              <span className="auth-footer-sep">/</span>
              <button onClick={() => router.push('/terms')} className="auth-footer-btn">Terms</button>
              <span className="auth-footer-sep">/</span>
              <button onClick={() => router.push('/privacy')} className="auth-footer-btn">Privacy</button>
            </div>
          </div>

          {/* RIGHT — Image (hidden on mobile) */}
          <div className="auth-image-panel">
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop" alt="Fashion" />
            <div className="auth-dot-overlay" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;