"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { homePathForRole } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(session ? homePathForRole(session.role) : "/login");
  }, [session, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center text-navy-700">
      <Spinner size="lg" />
    </div>
  );
}
