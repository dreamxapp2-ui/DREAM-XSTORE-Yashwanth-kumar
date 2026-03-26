import React, { useState } from "react";
import { apiClient } from '@/src/lib/api/client';
import { ENDPOINTS } from '@/src/lib/api/config';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";

// Zod schema for client-side validation (optional, mirrors backend)
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Type for form data
type LoginFormData = { email: string; password: string };

// Type for errors (matches signup)
type ErrorState = Partial<Record<keyof LoginFormData | "general", string>>;

export const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simulate login context (updated to include isBrand)
  const login = (token: string, user: { id: string; username: string; email: string; isBrand?: boolean }) => {
    localStorage.setItem(
      "dreamx_user",
      JSON.stringify({
        username: user.username, // Changed from firstName
        email: user.email,
        isBrand: user.isBrand, // Added
        avatarUrl: undefined,
        token,
      })
    );
    window.dispatchEvent(new Event("storage"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Client-side validation (optional)
      loginSchema.parse(formData);

      const data = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      login(data.token, {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        isBrand: data.user.isBrand,
      });
      router.push("/");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: ErrorState = {};
        err.issues.forEach((error) => {
          const field = error.path[0] as keyof LoginFormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message || "An error occurred during login" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const authUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/api$/, "");
    window.location.href = `${authUrl}/api${ENDPOINTS.GOOGLE_AUTH}`;
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <img src="https://i.postimg.cc/sx24cHZb/image-89.png" alt="DreamXStore" className="h-14 w-auto object-contain" />
          </div>
          
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h2>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.7 33.1 34.2 36 30.7 37.8V43H38.5C43.1 39 47.5 32.5 47.5 24.5Z" fill="#4285F4" />
              <path d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.8C30.7 38.1 28.1 38.9 24 38.9C17.7 38.9 12.2 34.7 10.3 29.2H2.5V34.8C6.5 42.1 14.6 48 24 48Z" fill="#34A853" />
              <path d="M10.3 29.2C9.7 27.9 9.3 26.5 9.3 25C9.3 23.5 9.7 22.1 10.3 20.8V15.2H2.5C0.9 18.2 0 21.5 0 25C0 28.5 0.9 31.8 2.5 34.8L10.3 29.2Z" fill="#FBBC05" />
              <path d="M24 9.1C28.1 9.1 30.7 10.8 32.1 12.1L40.3 4.1C36.2 0.7 30.6-1.5 24-1.5C14.6-1.5 6.5 4.4 2.5 11.7L10.3 17.3C12.2 11.8 17.7 7.6 24 7.6V9.1Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="mx-4 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm" role="alert">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button onClick={() => router.push("/signup")} className="text-blue-600 font-medium hover:underline">
              Sign up
            </button>
          </div>
          
          <div className="mt-2 text-center text-sm text-gray-500">
            Are you a brand?{" "}
            <button type="button" onClick={() => router.push("/brand-login")} className="text-blue-600 font-medium hover:underline">
              Sign In
            </button>
          </div>

          <div className="mt-2 text-center text-sm text-gray-500">
            Are you an admin?{" "}
            <button type="button" onClick={() => router.push("/admin/login")} className="text-blue-600 font-medium hover:underline">
              Admin Login
            </button>
          </div>
        </div>

        {/* Right Side - Image Background & Testimonial */}
        <div className="hidden md:flex w-1/2 relative bg-gray-900 overflow-hidden">
          {/* Main Background Image */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105" 
               style={{ backgroundImage: "url('/image/auth_fashion_bg.png')" }}>
          </div>
          
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Close Button Top Right */}
          <button onClick={() => router.push("/")} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors z-10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Testimonial Glass Card */}
          <div className="relative z-10 mt-auto mb-16 mx-12 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <p className="text-white text-lg leading-relaxed font-medium mb-6 drop-shadow-sm">
              "The best fashion discovery platform I've ever used. Beautiful, fast, and completely effortless. DreamXStore nailed it."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/30">
                <Image src="https://i.pravatar.cc/150?img=47" alt="User review" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex text-white/90 text-[10px] mb-1">
                  <span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span>
                </div>
                <h4 className="text-white text-sm font-medium">Sarah Jenkins</h4>
                <p className="text-white/70 text-xs">Fashion Blogger</p>
              </div>
            </div>
            {/* Pagination dots */}
            <div className="flex justify-center mt-6 space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
