import React, { useEffect, useState } from "react";

const VerificationLinkSentPage = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(localStorage.getItem("pendingVerificationEmail"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Verification Link Sent</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {email ? (
            <>A verification link has been sent to <span className="font-semibold">{email}</span>. Please check your inbox and follow the instructions to activate your account.</>
          ) : (
            <>A verification link has been sent to your email. Please check your inbox and follow the instructions to activate your account.</>
          )}
        </p>
        
      </div>
    </div>
  );
};

export default VerificationLinkSentPage;
