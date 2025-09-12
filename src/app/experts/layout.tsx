// src/app/experts/layout.tsx
"use client";

import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ExpertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
      {children}
    </Suspense>
  );
}
