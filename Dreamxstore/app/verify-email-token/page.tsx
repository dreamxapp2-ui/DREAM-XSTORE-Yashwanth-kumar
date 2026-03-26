"use client";

import React, { Suspense } from "react";
import VerifyEmailTokenPage from "../../src/screens/SignupPage/VerifyEmailTokenPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <VerifyEmailTokenPage />
    </Suspense>
  );
}
