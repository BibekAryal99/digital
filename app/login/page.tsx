"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { homePathForRole } from "@/lib/utils";
import { Button, Input, Card } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Ward Admin", username: "ward.admin", password: "ward123" },
  { label: "Municipality", username: "mun.admin", password: "mun123" },
  { label: "Province", username: "province.admin", password: "prov123" },
  { label: "Central", username: "central.admin", password: "central123" },
  { label: "System Admin", username: "sysadmin", password: "admin123" },
];

export default function LoginPage() {
  const { session, isLoading, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isLoading && session) router.replace(homePathForRole(session.role));
  }, [session, isLoading, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError("");
    if (!username || password.length < 4) return;
    setSubmitting(true);
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error ?? "Login failed");
      setSubmitting(false);
    }
  }

  function quickFill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mb-2 text-4xl">🇳🇵</div>
          <h1 className="text-2xl font-bold">Digital Nepal Citizen Ecosystem</h1>
          <p className="mt-1 text-sm text-navy-100">
            Kummayak Rural Municipality · Panchthar · Koshi Province
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-crimson via-crimson to-navy-700" />
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
            <Input
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={touched && !username ? "Username is required" : undefined}
              required
            />
            <Input
              label="Password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={
                touched && password.length < 4
                  ? "Password must be at least 4 characters"
                  : undefined
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="pointer-events-auto text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
            />
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" loading={submitting}>
              Sign in
            </Button>
          </form>

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Demo accounts (mock data) — click to fill:
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => quickFill(a.username, a.password)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-navy-600 hover:text-navy-700"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-navy-100">
          CONFIDENTIAL — Government of Nepal. Authorised personnel only.
        </p>
      </div>
    </div>
  );
}
