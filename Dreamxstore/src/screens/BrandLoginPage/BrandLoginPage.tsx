import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BrandAuthService } from "@/src/lib/api/brand/brandAuthService";

const brandLoginSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type BrandLoginFormData = { brandName: string; ownerEmail: string; password: string };
type ErrorState = Partial<Record<keyof BrandLoginFormData | "general", string>>;

export const BrandLoginPage = () => {
  const [formData, setFormData] = useState<BrandLoginFormData>({ brandName: "", ownerEmail: "", password: "" });
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      brandLoginSchema.parse(formData);
      const response = await BrandAuthService.login({ brandName: formData.brandName.trim(), ownerEmail: formData.ownerEmail.trim(), password: formData.password });
      if (response.success && response.token) router.push("/brand/dashboard");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fe: ErrorState = {};
        err.issues.forEach(e => { fe[e.path[0] as keyof BrandLoginFormData] = e.message; });
        setErrors(fe);
      } else if (err.response?.data?.field) {
        const f = err.response.data.field;
        setErrors(f && f !== "general" ? { [f]: err.response.data.message } : { general: err.response.data.message });
      } else {
        setErrors({ general: err.message || "Login failed. Check your credentials." });
      }
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name as keyof BrandLoginFormData]) setErrors(p => ({ ...p, [name]: undefined }));
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
        .auth-submit-btn { width: 100%; padding: 12px; background: #111; color: #fff; border: none; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .auth-submit-btn:hover:not(:disabled) { opacity: 0.85; }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { display: flex; gap: 14px; align-items: center; padding-top: 14px; flex-wrap: wrap; }
        .auth-footer-btn { background: none; border: none; font-size: 12px; color: #aaa; cursor: pointer; padding: 0; }
        .auth-field-err { font-size: 11px; color: #dc2626; margin-top: 3px; display: block; }
        @media (min-width: 640px) {
          .auth-page { background-color: #d1d5db; padding: 2rem; align-items: center; }
          .auth-card { max-width: 900px; min-height: auto; height: 580px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
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
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Brand Portal</h1>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Sign in to manage your brand on DreamXStore.</p>
              </div>

              {errors.general && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', fontSize: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #fee2e2' }}>{errors.general}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <input id="brandName" type="text" name="brandName" autoComplete="off" required placeholder="Brand Name" className="auth-input" value={formData.brandName} onChange={handleInputChange} />
                    {errors.brandName && <span className="auth-field-err">{errors.brandName}</span>}
                  </div>
                  <div>
                    <input id="ownerEmail" type="email" name="ownerEmail" autoComplete="email" required placeholder="Owner Email" className="auth-input" value={formData.ownerEmail} onChange={handleInputChange} />
                    {errors.ownerEmail && <span className="auth-field-err">{errors.ownerEmail}</span>}
                  </div>
                  <div>
                    <input id="password" type="password" name="password" autoComplete="current-password" required placeholder="Password" className="auth-input" value={formData.password} onChange={handleInputChange} />
                    {errors.password && <span className="auth-field-err">{errors.password}</span>}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Signing in...' : 'Sign in as Brand'}
                </button>
              </form>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '12.5px', color: '#888', margin: 0 }}>
                  Don&apos;t have a brand account?{' '}
                  <button onClick={() => router.push('/brand/register')} style={{ background: 'none', border: 'none', color: '#111', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Contact Us</button>
                </p>
                <p style={{ fontSize: '12.5px', color: '#888', margin: 0 }}>
                  Regular customer?{' '}
                  <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#111', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Sign in here</button>
                </p>
              </div>
            </div>

            <div className="auth-footer">
              <button onClick={() => router.push('/help')} className="auth-footer-btn">Help</button>
              <span style={{ color: '#ddd', fontSize: '12px' }}>/</span>
              <button onClick={() => router.push('/terms')} className="auth-footer-btn">Terms</button>
              <span style={{ color: '#ddd', fontSize: '12px' }}>/</span>
              <button onClick={() => router.push('/privacy')} className="auth-footer-btn">Privacy</button>
            </div>
          </div>

          <div className="auth-image-panel">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop" alt="Fashion" />
            <div className="auth-dot-overlay" />
          </div>
        </div>
      </div>
    </>
  );
};
