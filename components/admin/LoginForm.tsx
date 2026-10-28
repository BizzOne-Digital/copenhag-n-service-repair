"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="login-form" onSubmit={submit}>
      <span className="login-icon">
        <LockKeyhole size={26} />
      </span>
      <p className="eyebrow">COPENHAGEN SERVICE & REPAIR</p>
      <h1>ADMIN SIGN IN.</h1>
      <p>Manage your website, service requests and content.</p>
      {!configured && (
        <div className="setup-notice">
          Admin setup required. Configure MONGODB_URI and SESSION_SECRET in
          .env.local, then run the seed command with your initial admin
          credentials. See README.md.
        </div>
      )}
      <label className="field">
        Email
        <input type="email" name="email" required autoComplete="username" />
      </label>
      <label className="field">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      <button className="button" disabled={busy || !configured}>
        {busy ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
        {busy ? "Signing in..." : "Sign in securely"}
      </button>
      <a className="text-link" href="/">
        Back to website
      </a>
    </form>
  );
}
