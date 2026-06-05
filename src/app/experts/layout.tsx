import { Suspense } from "react";

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
