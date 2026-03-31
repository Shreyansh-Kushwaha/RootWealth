"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Unable to sign in.");
        return;
      }

      router.push("/");
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--background)] px-4 py-10 text-[color:var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-md rounded-3xl border border-surface bg-surface p-8 shadow-sm">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[color:var(--accent)] text-white">
            {mode === "login" ? <Lock className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-semibold text-primary">{mode === "login" ? "Sign in" : "Create your account"}</h1>
          <p className="text-sm text-muted">
            {mode === "login"
              ? "Login to manage your personal SIP portfolio and tax analytics."
              : "Register so your SIPs stay private and linked to your account."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-muted">
            Email address
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-surface bg-[color:var(--background)] px-4 py-3">
              <Mail className="h-4 w-4 text-muted" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                className="w-full bg-transparent text-[color:var(--foreground)] outline-none"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-muted">
            Password
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-surface bg-[color:var(--background)] px-4 py-3">
              <Lock className="h-4 w-4 text-muted" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full bg-transparent text-[color:var(--foreground)] outline-none"
                placeholder="Enter a strong password"
              />
            </div>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              Don’t have an account?{' '}
              <button type="button" onClick={() => setMode("register")} className="font-semibold text-[color:var(--accent)]">
                Register now
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode("login")} className="font-semibold text-[color:var(--accent)]">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
