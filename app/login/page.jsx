"use client";

import React from "react";

export const dynamic = "force-dynamic";

function safeNextPath(value) {
  return typeof value === "string" && value.startsWith("/admin") ? value : "/admin/workflow";
}

export default function LoginPage() {
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [nextPath, setNextPath] = React.useState("/admin/workflow");

  React.useEffect(() => {
    setNextPath(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Login failed.");
      }
      window.location.assign(nextPath);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="login-mark">C</div>
        <div>
          <p className="login-kicker">Collaburo Admin</p>
          <h1>Sign in</h1>
        </div>
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button className="login-submit" disabled={submitting || !username || !password}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
