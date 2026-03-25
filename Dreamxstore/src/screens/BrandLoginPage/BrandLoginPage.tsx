import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BrandAuthService } from "@/src/lib/api/brand/brandAuthService";

// Zod schema for client-side validation
const brandLoginSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Type for form data
type BrandLoginFormData = {
  brandName: string;
  ownerEmail: string;
  password: string;
};

// Type for errors
type ErrorState = Partial<Record<keyof BrandLoginFormData | "general", string>>;

export const BrandLoginPage = () => {
  const [formData, setFormData] = useState<BrandLoginFormData>({
    brandName: "",
    ownerEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Client-side validation
      brandLoginSchema.parse(formData);

      // Call brand login API
      const response = await BrandAuthService.login({
        brandName: formData.brandName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        password: formData.password,
      });

      if (response.success && response.token) {
        // Redirect to brand dashboard
        router.push("/brand/dashboard");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: ErrorState = {};
        err.issues.forEach((error) => {
          const field = error.path[0] as keyof BrandLoginFormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else if (err.response?.data?.field) {
        const errorMessage = err.response.data.message;
        const field = err.response.data.field;
        if (field && field !== "general") {
          setErrors({ [field]: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({
          general:
            err.message ||
            "Login failed. Please check your credentials and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof BrandLoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">DreamXStore Brand</h1>
          </div>
          
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Login</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm" role="alert">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              {/* Brand Name Input */}
              <div>
                <input
                  id="brandName"
                  type="text"
                  name="brandName"
                  autoComplete="off"
                  required
                  value={formData.brandName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Brand Name"
                />
                {errors.brandName && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.brandName}</p>
                )}
              </div>

              {/* Owner Email Input */}
              <div>
                <input
                  id="ownerEmail"
                  type="email"
                  name="ownerEmail"
                  autoComplete="email"
                  required
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Owner Email"
                />
                {errors.ownerEmail && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.ownerEmail}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="mx-4 text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          {/* Help Text */}
          <div className="text-center space-y-3 pb-8">
            <p className="text-sm text-gray-500">
              Don't have a brand account?{" "}
              <button
                type="button"
                onClick={() => router.push("/brand/register")}
                className="font-medium text-purple-600 hover:underline"
              >
                Contact us
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Regular customer?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in here
              </button>
            </p>
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
              "DreamX empowers our brand to reach millions of fashion enthusiasts with zero hassle. It's the ultimate platform."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/30">
                <img src="https://i.pravatar.cc/150?img=68" alt="Brand review" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex text-white/90 text-[10px] mb-1">
                  <span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span><span className="text-yellow-400">★</span>
                </div>
                <h4 className="text-white text-sm font-medium">Michael Chen</h4>
                <p className="text-white/70 text-xs">Vogue Atelier</p>
              </div>
            </div>
            {/* Pagination dots */}
            <div className="flex justify-center mt-6 space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
