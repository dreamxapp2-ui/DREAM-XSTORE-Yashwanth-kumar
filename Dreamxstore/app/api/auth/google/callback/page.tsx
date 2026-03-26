"use client";

import React, { Suspense } from "react";
import Callback from "../../../../../src/screens/LoginPage/Callback";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <Callback />
    </Suspense>
  );
}
