"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProDeskPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/pro/mypage"); }, [router]);
  return null;
}
