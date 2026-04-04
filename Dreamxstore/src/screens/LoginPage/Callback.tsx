// import React, { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// function Callback() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const token = searchParams?.get("token");
//     const userData = searchParams?.get("user");

//     if (token && userData) {
//       try {
//         const user = JSON.parse(userData);
//         localStorage.setItem("dreamx_user", JSON.stringify({
//           ...user,
//           token,
//         }));
//         window.dispatchEvent(new Event("storage"));
//         router.replace("/");
//       } catch (error) {
//         router.replace("/signup?error=invalid-user-data");
//       }
//     } else {
//       router.replace("/signup?error=google-auth-failed");
//     }
//   }, [router, searchParams]);

//   return (
//     <div className="text-center">
//       <h2 className="text-2xl font-bold mb-4">Processing...</h2>
//       <p>Please wait while we complete your signup.</p>
//       {typeof window !== "undefined" && (
//         <button
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
//           onClick={() => router.push("/")}
//         >
//           Go to Home
//         </button>
//       )}
//     </div>
//   );
// }

// export default Callback;
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (!token || !user) {
      setError("Authentication failed: Missing token or user data");
      return;
    }

    try {
      // Decode and parse user data
      const decodedUser = JSON.parse(decodeURIComponent(user));
      
      // Store token and user data in localStorage (consistent with regular login)
      localStorage.setItem("token", token);
      localStorage.setItem("dreamx_user", JSON.stringify({
        username: decodedUser.username,
        email: decodedUser.email,
        isBrand: decodedUser.isBrand,
        avatarUrl: decodedUser.profilePicture || undefined,
        profilePicture: decodedUser.profilePicture || undefined,
        token,
      }));

      // Trigger storage event for any listeners
      window.dispatchEvent(new Event("storage"));

      // Redirect to home/trending page (Google OAuth users are auto-verified)
      router.push("/");
    } catch (err) {
      setError("Failed to process authentication data");
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-center text-red-600 dark:text-red-400">Authentication Error</h2>
          <p className="mt-4 text-center text-gray-900 dark:text-white">{error}</p>
          <button
            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => router.push("/signup")}
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Processing...</h2>
        <p className="mt-4 text-center text-gray-900 dark:text-white">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;