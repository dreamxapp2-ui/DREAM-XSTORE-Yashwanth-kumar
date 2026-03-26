import React, { useState } from "react";
import { apiClient } from '@/src/lib/api/client';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";

// Define Zod schema for form validation (unchanged, matches backend)
const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/^(?=.*\d)/, "Password must contain at least one number")
      .regex(/^(?=.*[@$!%*?&#\-_.,;:()[\]{}'"<>~`+=|\\\/])/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Infer TypeScript type from Zod schema
type SignupFormData = z.infer<typeof signupSchema>;

// Extend errors type for global
type ErrorState = Partial<Record<keyof SignupFormData | 'general', string>>;

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [globalError, setGlobalError] = useState<string | null>(null);  // Upgrade: Global errors
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = signupSchema.parse(formData);

      const data = await apiClient.post('/auth/signup', {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      });

      // Store user data/email for post-signup use if needed
      if (data.user) {
        localStorage.setItem("pendingUser", JSON.stringify(data.user));
      }
      localStorage.setItem("pendingVerificationEmail", validatedData.email);

      // Redirect to verification link sent page
      router.push("/verification-link-sent");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
        err.issues.forEach((error) => {
          const field = error.path[0] as keyof SignupFormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setGlobalError(err.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  // Upgrade: Stub for real-time username check (uncomment & implement backend endpoint)
  // const checkUsernameAvailability = async (username: string) => {
  //   if (username.length < 3) return;
  //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  //   const res = await fetch(`${apiUrl}/auth/check-username?username=${username}`);
  //   if (!res.ok) {
  //     setErrors({ username: 'Username taken' });
  //   } else {
  //     setErrors({ ...errors, username: undefined });
  //   }
  // };

  const handleGoogleSignup = () => {
    const authBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/api$/, "");
    window.location.href = `${authBaseUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Signup Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-4">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">DreamXStore</h1>
          </div>
          
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.7 33.1 34.2 36 30.7 37.8V43H38.5C43.1 39 47.5 32.5 47.5 24.5Z" fill="#4285F4" />
              <path d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.8C30.7 38.1 28.1 38.9 24 38.9C17.7 38.9 12.2 34.7 10.3 29.2H2.5V34.8C6.5 42.1 14.6 48 24 48Z" fill="#34A853" />
              <path d="M10.3 29.2C9.7 27.9 9.3 26.5 9.3 25C9.3 23.5 9.7 22.1 10.3 20.8V15.2H2.5C0.9 18.2 0 21.5 0 25C0 28.5 0.9 31.8 2.5 34.8L10.3 29.2Z" fill="#FBBC05" />
              <path d="M24 9.1C28.1 9.1 30.7 10.8 32.1 12.1L40.3 4.1C36.2 0.7 30.6-1.5 24-1.5C14.6-1.5 6.5 4.4 2.5 11.7L10.3 17.3C12.2 11.8 17.7 7.6 24 7.6V9.1Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="mx-4 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {globalError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm" role="alert">
                {globalError}
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Username"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-600 dark:text-gray-300 text-sm">I agree to the Terms of Service</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center mt-4"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button onClick={() => router.push("/login")} className="text-blue-600 font-medium hover:underline">
              Sign in
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

export default SignupPage;