"use client";

import React, { Suspense } from "react";
import { ProductPage } from "../../../src/screens/ProductPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductPage />
    </Suspense>
  );
}
