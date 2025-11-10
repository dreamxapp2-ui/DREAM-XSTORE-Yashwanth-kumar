// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { z } from "zod";

// // Define Zod schema for form validation
// const signupSchema = z
//   .object({
//     username: z
//       .string()
//       .min(3, "Username must be at least 3 characters")
//       .max(20, "Username cannot exceed 20 characters")
//       .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
//     email: z.email("Invalid email address"),
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
//         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
//       ),
//     confirmPassword: z.string(),
//     isBrand: z.boolean(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"], // Attach error to confirmPassword field
//   });

// // Infer TypeScript type from Zod schema
// type SignupFormData = z.infer<typeof signupSchema>;

// const SignupPage = () => {
//   const [formData, setFormData] = useState<SignupFormData>({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     isBrand: false,
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});
//     setLoading(true);

//     try {
//       // Validate form data with Zod
//       const validatedData = signupSchema.parse(formData);

//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
//       const response = await fetch(`${apiUrl}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: validatedData.username,
//           email: validatedData.email,
//           password: validatedData.password,
//           isBrand: validatedData.isBrand,
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Signup failed");
//       }

//       // Store email for verification page (optional)
//       localStorage.setItem("pendingVerificationEmail", validatedData.email);
//       // Redirect to verification link sent page
//       router.push("/verification-link-sent");
//     } catch (err: any) {
//       if (err instanceof z.ZodError) {
//         // Handle Zod validation errors
//         const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
//         err.issues.forEach((error) => {
//           const field = error.path[0] as keyof SignupFormData;
//           fieldErrors[field] = error.message;
//         });
//         setErrors(fieldErrors);
//       } else {
//         // Handle API or other errors
//         setErrors({ email: err instanceof Error ? err.message : "An error occurred during signup" });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignup = () => {
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
//     window.location.href = `${apiUrl}/auth/google`;
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
//         <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Create your account</h2>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                 className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
//                   errors.username ? "border-red-500" : "border-gray-300 dark:border-gray-700"
//                 } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 placeholder="Username"
//               />
//               {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
//             </div>
//             <div>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
//                   errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
//                 } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 placeholder="Email address"
//               />
//               {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//             </div>
//             <div>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
//                   errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"
//                 } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 placeholder="Password"
//               />
//               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//             </div>
//             <div>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                 className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
//                   errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-700"
//                 } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 placeholder="Confirm Password"
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
//               )}
//             </div>
//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 name="isBrand"
//                 checked={formData.isBrand}
//                 onChange={(e) => setFormData({ ...formData, isBrand: e.target.checked })}
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
//               />
//               <span className="text-gray-900 dark:text-white text-sm">Are you a brand?</span>
//             </label>
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? "Signing up..." : "Sign up"}
//           </button>
//         </form>
//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
//           <span className="mx-2 text-gray-400 dark:text-gray-500">or</span>
//           <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
//         </div>
//         <button
//           type="button"
//           onClick={handleGoogleSignup}
//           className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <g clipPath="url(#clip0_17_40)">
//               <path
//                 d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.7 33.1 34.2 36 30.7 37.8V43H38.5C43.1 39 47.5 32.5 47.5 24.5Z"
//                 fill="#4285F4"
//               />
//               <path
//                 d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.8C30.7 38.1 28.1 38.9 24 38.9C17.7 38.9 12.2 34.7 10.3 29.2H2.5V34.8C6.5 42.1 14.6 48 24 48Z"
//                 fill="#34A853"
//               />
//               <path
//                 d="M10.3 29.2C9.7 27.9 9.3 26.5 9.3 25C9.3 23.5 9.7 22.1 10.3 20.8V15.2H2.5C0.9 18.2 0 21.5 0 25C0 28.5 0.9 31.8 2.5 34.8L10.3 29.2Z"
//                 fill="#FBBC05"
//               />
//               <path
//                 d="M24 9.1C28.1 9.1 30.7 10.8 32.1 12.1L40.3 4.1C36.2 0.7 30.6-1.5 24-1.5C14.6-1.5 6.5 4.4 2.5 11.7L10.3 17.3C12.2 11.8 17.7 7.6 24 7.6V9.1Z"
//                 fill="#EA4335"
//               />
//             </g>
//             <defs>
//               <clipPath id="clip0_17_40">
//                 <rect width="48" height="48" fill="white" />
//               </clipPath>
//             </defs>
//           </svg>
//           Sign up with Google
//         </button>
//         <div className="text-center mt-4">
//           <p>
//             Already have an account?{' '}
//             <button
//               className="text-indigo-600 dark:text-indigo-400 hover:underline"
//               onClick={() => router.push("/login")}
//             >
//               Sign in
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    setGlobalError(null);  // Clear previous
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = signupSchema.parse(formData);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: validatedData.username,
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const { message, field } = errorData;  // Fix: Parse backend shape
        if (field && field !== 'general') {
          setErrors({ [field]: message });  // Field-specific
        } else {
          setGlobalError(message || "Signup failed");  // Global
        }
        throw new Error(message || "Signup failed");
      }

      const result = await response.json();
      // Upgrade: Store user data for post-signup use
      localStorage.setItem("pendingUser", JSON.stringify(result.user));  // Includes isBrand, username
      localStorage.setItem("pendingVerificationEmail", validatedData.email);

      // Redirect to verification link sent page
      router.push("/verification-link-sent");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors (unchanged)
        const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
        err.issues.forEach((error) => {
          const field = error.path[0] as keyof SignupFormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        // Fallback for network/other errors
        setGlobalError(err instanceof Error ? err.message : "An error occurred during signup");
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
    const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
    window.location.href = `${authBaseUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Create your account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Upgrade: Global error display */}
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{globalError}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                // onBlur={() => checkUsernameAvailability(formData.username)}  // Upgrade stub
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Username"
                aria-invalid={!!errors.username}  // Upgrade: Accessibility
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border ${
                    errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Confirm Password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
              />
              <span className="text-gray-900 dark:text-white text-sm">I agree to the Terms of Service</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            aria-disabled={loading}  // Upgrade: Accessibility
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>  // Upgrade: Spinner
            ) : null}
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-2 text-gray-400 dark:text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.7 33.1 34.2 36 30.7 37.8V43H38.5C43.1 39 47.5 32.5 47.5 24.5Z"
                fill="#4285F4"
              />
              <path
                d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.8C30.7 38.1 28.1 38.9 24 38.9C17.7 38.9 12.2 34.7 10.3 29.2H2.5V34.8C6.5 42.1 14.6 48 24 48Z"
                fill="#34A853"
              />
              <path
                d="M10.3 29.2C9.7 27.9 9.3 26.5 9.3 25C9.3 23.5 9.7 22.1 10.3 20.8V15.2H2.5C0.9 18.2 0 21.5 0 25C0 28.5 0.9 31.8 2.5 34.8L10.3 29.2Z"
                fill="#FBBC05"
              />
              <path
                d="M24 9.1C28.1 9.1 30.7 10.8 32.1 12.1L40.3 4.1C36.2 0.7 30.6-1.5 24-1.5C14.6-1.5 6.5 4.4 2.5 11.7L10.3 17.3C12.2 11.8 17.7 7.6 24 7.6V9.1Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Sign up with Google
        </button>
        <div className="text-center mt-4">
          <p>
            Already have an account?{' '}
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;