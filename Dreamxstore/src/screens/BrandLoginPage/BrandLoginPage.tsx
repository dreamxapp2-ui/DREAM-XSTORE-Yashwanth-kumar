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
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/image/login-bg.jpg')" }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-center text-purple-600 dark:text-purple-400 mb-2">
            Brand Login
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Sign in to your brand account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* General Error */}
          {errors.general && (
            <div
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg"
              role="alert"
            >
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          {/* Brand Name Input */}
          <div>
            <label
              htmlFor="brandName"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Brand Name
            </label>
            <input
              id="brandName"
              type="text"
              name="brandName"
              autoComplete="off"
              required
              value={formData.brandName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                errors.brandName
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
              placeholder="Enter your brand name"
              aria-invalid={!!errors.brandName}
              aria-describedby={
                errors.brandName ? "brandName-error" : undefined
              }
            />
            {errors.brandName && (
              <p
                id="brandName-error"
                className="text-red-500 dark:text-red-400 text-xs mt-1"
              >
                {errors.brandName}
              </p>
            )}
          </div>

          {/* Owner Email Input */}
          <div>
            <label
              htmlFor="ownerEmail"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Owner Email
            </label>
            <input
              id="ownerEmail"
              type="email"
              name="ownerEmail"
              autoComplete="email"
              required
              value={formData.ownerEmail}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                errors.ownerEmail
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
              placeholder="Enter owner email"
              aria-invalid={!!errors.ownerEmail}
              aria-describedby={
                errors.ownerEmail ? "ownerEmail-error" : undefined
              }
            />
            {errors.ownerEmail && (
              <p
                id="ownerEmail-error"
                className="text-red-500 dark:text-red-400 text-xs mt-1"
              >
                {errors.ownerEmail}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                errors.password
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
              placeholder="Enter password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-red-500 dark:text-red-400 text-xs mt-1"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          {/* <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/brand/forgot-password")}
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Forgot your password?
            </button>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            aria-disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-2 text-gray-400 dark:text-gray-500 text-sm">
            or
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have a brand account?{" "}
            <button
              type="button"
              onClick={() => router.push("/brand/register")}
              className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Contact us to create one
            </button>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-600">
            Regular customer?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
