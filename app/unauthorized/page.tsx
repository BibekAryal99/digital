"use client";

import { useAuth } from "@/lib/auth-context";
import { homePathForRole } from "@/lib/utils";
import { Button } from "@/components/ui";
import ShieldX from "@mui/icons-material/GppBad";

export default function UnauthorizedPage() {
  const { session } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <ShieldX className="h-16 w-16 text-red-500" />
      <h1 className="text-2xl font-bold text-slate-900">403 — Access denied</h1>
      <p className="max-w-md text-slate-500">
        You do not have access to this area. Each governance tier can only access
        its own dashboard.
      </p>
      {session ? (
        <Button onClick={() => (window.location.href = homePathForRole(session.role))}>
          Go to my dashboard
        </Button>
      ) : (
        <Button onClick={() => (window.location.href = "/login")}>
          Back to login
        </Button>
      )}
    </div>
  );
}
