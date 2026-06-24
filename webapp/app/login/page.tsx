"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    setNotAllowed(new URLSearchParams(window.location.search).get("error") === "not-allowed");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>
          Molly&apos;s <span className="note">Song</span>
        </h1>
        <p className="muted" style={{ marginTop: 4, marginBottom: 22 }}>
          Sign in to the project hub.
        </p>

        {notAllowed && (
          <div className="banner warn" style={{ marginBottom: 16 }}>
            That account isn&apos;t allowed to access this project.
          </div>
        )}

        {status === "sent" ? (
          <div className="banner" style={{ borderLeftColor: "var(--green)" }}>
            Check your inbox — a magic sign-in link is on its way to{" "}
            <b>{email}</b>. Open it on this device to continue.
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {status === "error" && (
              <div className="muted" style={{ color: "var(--rust)", fontSize: 13, marginBottom: 12 }}>
                {msg}
              </div>
            )}
            <button className="btn primary" type="submit" disabled={status === "sending"} style={{ width: "100%" }}>
              {status === "sending" ? "Sending…" : "Email me a magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
