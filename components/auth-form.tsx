"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function submitAuth() {
    if (!supabase) {
      setMessage("Supabase keys are not configured. You can still use the MVP dashboard in demo mode.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    router.push("/app");
  }

  return (
    <div className="auth-card card card-inner">
      <div className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</div>
      <h1>{mode === "login" ? "Log in to Meridian" : "Start your Meridian studio"}</h1>
      {!supabase && (
        <div className="notice">
          Supabase credentials are missing. Authentication UI is ready, and the studio runs in demo
          local-storage mode until keys are added.
        </div>
      )}
      <div className="form-grid" style={{ marginTop: 20 }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            className="input"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </div>
        <button className="button primary full" disabled={isLoading} onClick={submitAuth}>
          {isLoading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        {message && <p className="muted">{message}</p>}
        <p className="muted">
          {mode === "login" ? "Need an account? " : "Already have an account? "}
          <Link href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
