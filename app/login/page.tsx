"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { motion } from "framer-motion";

const supabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT");

function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setError("Supabase not configured. Add credentials to .env.local and restart the dev server.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(searchParams.get("redirect") ?? "/play");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(
        msg.toLowerCase().includes("failed to fetch")
          ? "Cannot reach authentication server. Add your Supabase credentials to .env.local and restart the dev server."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <GlowCard accentColor="magenta">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: "1px solid #FF00FF33" }}>
        <div className="w-3 h-3 rounded-full bg-[#FF00FF]" />
        <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
        <div className="w-3 h-3 rounded-full bg-[#FF9900]" />
        <span className="font-mono text-xs text-[#FF00FF]/60 ml-2 uppercase tracking-widest">auth_terminal.exe</span>
      </div>

      {/* Supabase not configured warning */}
      {!supabaseConfigured && (
        <div className="mb-6 p-3 font-mono text-xs" style={{ border: "1px solid #FF9900", color: "#FF9900", background: "rgba(255,153,0,0.05)" }}>
          ⚡ Supabase not configured — auth is disabled.<br />
          Add your credentials to <span className="text-[#00FFFF]">.env.local</span> and restart the server.
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex mb-6" style={{ borderBottom: "1px solid #2D1B4E" }}>
        {(["login", "signup"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 py-2 font-mono text-xs uppercase tracking-widest transition-colors"
            style={{ color: mode === m ? "#FF00FF" : "#E0E0E0", borderBottom: mode === m ? "2px solid #FF00FF" : "2px solid transparent" }}>
            {m === "login" ? "Login" : "Sign Up"}
          </button>
        ))}
      </div>

      <h1 className="font-heading font-black text-3xl mb-8" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif", textShadow: "0 0 20px #FF00FF" }}>
        {mode === "login" ? "WELCOME BACK" : "JOIN THE GRID"}
      </h1>

      {success ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-mono text-sm text-[#00FFFF] text-center p-4" style={{ border: "1px solid #00FFFF" }}>
          {success}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/60 block mb-2">&gt; Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required
                type="text" placeholder="your_handle"
                className="w-full px-3 py-3 font-mono text-sm bg-black text-[#00FFFF] placeholder:text-[#FF00FF]/30 outline-none"
                style={{ borderBottom: "2px solid #FF00FF" }} />
            </div>
          )}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/60 block mb-2">&gt; Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required
              type="email" placeholder="user@grid.io"
              className="w-full px-3 py-3 font-mono text-sm bg-black text-[#00FFFF] placeholder:text-[#FF00FF]/30 outline-none"
              style={{ borderBottom: "2px solid #FF00FF" }} />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/60 block mb-2">&gt; Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} required
              type="password" placeholder="••••••••"
              className="w-full px-3 py-3 font-mono text-sm bg-black text-[#00FFFF] placeholder:text-[#FF00FF]/30 outline-none"
              style={{ borderBottom: "2px solid #FF00FF" }} />
          </div>

          {error && (
            <div className="font-mono text-xs text-[#FF2D78] p-2" style={{ border: "1px solid #FF2D78" }}>
              ⚠ {error}
            </div>
          )}

          <SkewButton type="submit" variant="primary" disabled={loading || !supabaseConfigured} className="w-full justify-center !py-4">
            {loading ? "Processing..." : !supabaseConfigured ? "Auth Disabled" : mode === "login" ? "Access Grid" : "Create Account"}
          </SkewButton>

          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-1" style={{ height: 1, background: "#2D1B4E" }} />
            <span className="font-mono text-xs text-[#E0E0E0]/40 uppercase">or</span>
            <div className="flex-1" style={{ height: 1, background: "#2D1B4E" }} />
          </div>

          <button type="button" onClick={handleGoogleLogin}
            className="w-full py-3 font-mono text-sm uppercase tracking-wider transition-colors"
            style={{ border: "2px solid #2D1B4E", color: "#E0E0E0" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#00FFFF")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#2D1B4E")}>
            Continue with Google
          </button>
        </form>
      )}
    </GlowCard>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative pt-24 flex items-center justify-center px-4">
      <PerspectiveGrid />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="font-mono text-sm text-[#00FFFF] text-center p-8">Loading...</div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
