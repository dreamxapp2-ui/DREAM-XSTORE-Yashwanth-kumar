
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";

// export const LoginPage = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // Simulate login context
//   const login = (token: string, user: { id: string; username: string; email: string }) => {
//     // Store user in localStorage for demo
//     localStorage.setItem("dreamx_user", JSON.stringify({
//       firstName: user.username,
//       email: user.email,
//       avatarUrl: undefined,
//       token,
//     }));
//     window.dispatchEvent(new Event("storage"));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch(`http://localhost:3001/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password
//         }),
//       });
//       console.log(response)

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Invalid email or password');
//       }

//       const data = await response.json();
//       console.log(data);
//       // Save token separately for checkout flow
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//       }
//       // Use the login function from auth context
//       login(data.token, {
//         id: data.user.id,
//         username: data.user.username,
//         email: data.user.email
//       });
//       router.push('/trending');
//     } catch (err: any) {
//         console.log("Login error:", err);
//       setError(err.message || 'An error occurred during login');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Google Sign-In handler (from provided code)
//   const handleGoogleLogin = () => {
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
//     window.location.href = `${apiUrl}/auth/google`;
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
//         <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Sign in to your account</h2>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <input
//               type="email"
//               autoComplete="email"
//               required
//               value={formData.email}
//               onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
//               className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Email address"
//             />
//             <input
//               type="password"
//               autoComplete="current-password"
//               required
//               value={formData.password}
//               onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
//               className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Password"
//             />
//           </div>
//           <div className="flex items-center justify-between">
//             <div className="text-sm">
//               <a href="#" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>
//           {error && <div className="text-red-500 text-sm text-center">{error}</div>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             {loading ? 'Signing in...' : 'Sign in'}
//           </button>
//         </form>
//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
//           <span className="mx-2 text-gray-400 dark:text-gray-500">or</span>
//           <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
//         </div>
//         <button
//           type="button"
//           onClick={() => handleGoogleLogin()}
//           className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         >
//           <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <g clipPath="url(#clip0_17_40)">
//               <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.4C36.7 33.1 34.2 36 30.7 37.8V43H38.5C43.1 39 47.5 32.5 47.5 24.5Z" fill="#4285F4"/>
//               <path d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.8C30.7 38.1 28.1 38.9 24 38.9C17.7 38.9 12.2 34.7 10.3 29.2H2.5V34.8C6.5 42.1 14.6 48 24 48Z" fill="#34A853"/>
//               <path d="M10.3 29.2C9.7 27.9 9.3 26.5 9.3 25C9.3 23.5 9.7 22.1 10.3 20.8V15.2H2.5C0.9 18.2 0 21.5 0 25C0 28.5 0.9 31.8 2.5 34.8L10.3 29.2Z" fill="#FBBC05"/>
//               <path d="M24 9.1C28.1 9.1 30.7 10.8 32.1 12.1L40.3 4.1C36.2 0.7 30.6-1.5 24-1.5C14.6-1.5 6.5 4.4 2.5 11.7L10.3 17.3C12.2 11.8 17.7 7.6 24 7.6V9.1Z" fill="#EA4335"/>
//             </g>
//             <defs>
//               <clipPath id="clip0_17_40">
//                 <rect width="48" height="48" fill="white"/>
//               </clipPath>
//             </defs>
//           </svg>
//           Sign in with Google
//         </button>
//         <div className="text-center mt-4">
//           <p>
//             Don't have an account?{' '}
//             <button className="text-indigo-600 dark:text-indigo-400 hover:underline" onClick={() => router.push('/signup')}>
//               Sign up
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // Check content-type to avoid HTML parse error
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorData = await response.json();
        const { message, field } = errorData;
        if (field && field !== "general") {
          setErrors({ [field]: message });
        } else if (message.includes("verify your email")) {
          setErrors({ general: "Please verify your email first. Check your inbox or request a new link." });
          // Optional: router.push('/verify-email');
        } else {
          setErrors({ general: message || "Invalid email or password" });
        }
        throw new Error(message || "Login failed");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      login(data.token, {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        isBrand: data.user.isBrand, // Added
      });
      router.push("/trending");
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
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
    window.location.href = `${authUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Sign in to your account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errors.general}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")} // Placeholder; implement endpoint
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            aria-disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-2 text-gray-400 dark:text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
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
          Sign in with Google
        </button>
        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <button
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
