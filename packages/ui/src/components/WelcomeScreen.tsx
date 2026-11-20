import React, { useState } from "react";
import type { ResetPasswordSubmit } from "@whoami/types";
import {
  AlertTriangleIcon,
  CheckIcon,
  CodefyLogo,
  EyeIcon,
  EyeOffIcon,
  FlowGraphIcon,
  LockIcon,
  RemoteScanIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "./Icons.js";
import { ThemePicker } from "./ThemePicker.js";
import { useTheme } from "./ThemeContext.js";

export type WelcomeAuthResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export type WelcomeRegisterResult =
  | { readonly ok: true; readonly status: "authenticated" }
  | { readonly ok: true; readonly status: "pending_verification"; readonly email: string }
  | { readonly ok: false; readonly error: string };

export type Mode =
  | "welcome"
  | "login"
  | "register"
  | "verify"
  | "forgot_password"
  | "reset_password"
  | "theme_pick";

export interface WelcomeScreenProps {
  readonly onLogin: (email: string, password: string) => Promise<WelcomeAuthResult>;
  readonly onRegister: (
    name: string,
    email: string,
    password: string,
  ) => Promise<WelcomeRegisterResult>;
  readonly onVerifyCode: (email: string, code: string) => Promise<WelcomeAuthResult>;
  readonly onResendCode: (email: string) => Promise<void>;
  readonly onForgotPassword?: (email: string) => Promise<WelcomeAuthResult>;
  readonly onResetPassword?: (req: ResetPasswordSubmit) => Promise<WelcomeAuthResult>;
  /** When provided, shows a "Continue Offline" link below the auth form. */
  readonly onContinueOffline?: () => void;
  /** Initial mode to start in: defaults to "welcome" showcase */
  readonly initialMode?: Mode;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[rgba(16,16,24,0.75)] px-3 py-2 text-sm text-[#F8F8F8] placeholder-[#686870] focus:border-[#00B887] focus:ring-1 focus:ring-[#00B887]/50 focus:outline-none transition-colors";
const labelClass = "block text-xs font-semibold text-[#E0E0E0] mb-1";

interface FeatureCardInfo {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly badge: string;
  readonly badgeColor: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string }>;
  readonly iconColor: string;
  readonly glowColor: string;
}

const FEATURES: readonly FeatureCardInfo[] = [
  {
    id: "sast",
    title: "Deterministic SAST",
    subtitle: "AST Taint Engine",
    description: "Deep multi-file AST taint-flow tracking from untrusted sources to sinks with zero alert fatigue.",
    badge: "Zero False Positives",
    badgeColor: "text-[#00B887] border-[#00B887]/30 bg-[#00B887]/10",
    icon: ShieldAlertIcon,
    iconColor: "text-[#00B887]",
    glowColor: "from-[#00B887]/20 to-transparent",
  },
  {
    id: "graphs",
    title: "Attack Flow Graphs",
    subtitle: "Topological Tracing",
    description: "Interactive visual inspection of data flows, blast radius, control flow, and sanitizer bypass vectors.",
    badge: "Cytoscape & ELK",
    badgeColor: "text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10",
    icon: FlowGraphIcon,
    iconColor: "text-[#38BDF8]",
    glowColor: "from-[#38BDF8]/20 to-transparent",
  },
  {
    id: "dast",
    title: "Exploit Verification",
    subtitle: "Target DAST Engine",
    description: "Automated live endpoint probe synthesis, runtime verification, and verified proof-of-concept exploits.",
    badge: "Live PoC Sandbox",
    badgeColor: "text-[#E03858] border-[#E03858]/30 bg-[#E03858]/10",
    icon: RemoteScanIcon,
    iconColor: "text-[#E03858]",
    glowColor: "from-[#E03858]/20 to-transparent",
  },
  {
    id: "copilot",
    title: "AI Security Copilot",
    subtitle: "Autonomous Remediation",
    description: "Contextual AI patch generation, instant unified diffs, remediation testing, and threat triage briefings.",
    badge: "One-Click Diffs",
    badgeColor: "text-[#F7931A] border-[#F7931A]/30 bg-[#F7931A]/10",
    icon: SparklesIcon,
    iconColor: "text-[#F7931A]",
    glowColor: "from-[#F7931A]/20 to-transparent",
  },
];

export function WelcomeScreen({
  onLogin,
  onRegister,
  onVerifyCode,
  onResendCode,
  onForgotPassword,
  onResetPassword,
  onContinueOffline,
  initialMode = "welcome",
}: WelcomeScreenProps): React.ReactElement {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const { theme: currentTheme } = useTheme();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCode("");
    setResetSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const result = await onLogin(email.trim(), password);
        if (!result.ok) setError(result.error);
      } else if (mode === "register") {
        const result = await onRegister(name.trim(), email.trim(), password);
        if (!result.ok) {
          setError(result.error);
        } else if (result.status === "pending_verification") {
          setPendingEmail(result.email);
          setCode("");
          setMode("verify");
        }
      } else if (mode === "verify") {
        const result = await onVerifyCode(pendingEmail, code.trim());
        if (!result.ok) setError(result.error);
      } else if (mode === "forgot_password") {
        if (!onForgotPassword) {
          setError("Password reset is not configured.");
          return;
        }
        const result = await onForgotPassword(email.trim());
        if (!result.ok) {
          setError(result.error);
        } else {
          setPendingEmail(email.trim());
          setCode("");
          setMode("reset_password");
        }
      } else if (mode === "reset_password") {
        if (!onResetPassword) {
          setError("Password reset is not configured.");
          return;
        }
        if (newPassword.length < 8) {
          setError("New password must be at least 8 characters long.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        const result = await onResetPassword({
          email: pendingEmail,
          code: code.trim(),
          newPassword,
        });
        if (!result.ok) {
          setError(result.error);
        } else {
          setMode("login");
          setResetSuccess("Password successfully updated! Please log in with your new password.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setResendStatus(null);
    try {
      if (mode === "reset_password" && onForgotPassword) {
        await onForgotPassword(pendingEmail);
      } else {
        await onResendCode(pendingEmail);
      }
      setResendStatus("Code resent — check your inbox.");
    } catch {
      setResendStatus("Couldn't resend the code. Try again shortly.");
    } finally {
      setTimeout(() => setResendStatus(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black text-[#E0E0E0] p-4 font-sans select-none overflow-y-auto overflow-x-hidden">
      {/* ── AMBIENT OPTICAL GRADIENT MESH BACKGROUND (Liquid Glass Refraction) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-[12%] w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-[0.08] bg-cyan-500" />
        <div className="absolute bottom-10 left-[18%] w-[24rem] h-[24rem] rounded-full blur-[140px] opacity-[0.07] bg-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 0.7px, transparent 0.7px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── 1. WELCOME HERO SHOWCASE SCREEN (Matching Wireframe) ── */}
      {mode === "welcome" && (
        <div className="relative z-10 flex flex-col items-center gap-7 w-full max-w-5xl py-6 animate-in fade-in duration-300">
          {/* Top Circular Logo Badge in White/Black Format matching background */}
          <div className="relative flex flex-col items-center text-center">
            <div className="relative group mb-3 cursor-default">
              {/* Outer ambient halo glow */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-white/20 via-emerald-500/20 to-cyan-500/20 blur-md opacity-80 group-hover:opacity-100 transition duration-500" />
              {/* Outer Liquid Glass refraction rim */}
              <div
                className="relative flex items-center justify-center w-16 h-16 rounded-2xl border border-white/15 bg-[#090909] p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
                style={{
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)",
                }}
              >
                {/* Inner white circular core with monochrome black logo */}
                  <div className="flex items-center justify-center w-full h-full rounded-xl bg-[#f4f7f6] text-black shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                  <CodefyLogo size={30} className="text-black" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8F8F8] drop-shadow-sm">
              Codefy
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A8A8] max-w-lg mt-1.5 font-medium leading-relaxed">
              Deterministic Taint Flow Intelligence & Autonomous AST Security Scanner
            </p>
          </div>

          {/* 4 Feature Cards Row ("List of features we offer") */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[rgba(24,24,32,0.7)] hover:bg-[rgba(32,32,42,0.88)] hover:border-white/25 p-4.5 sm:p-5 backdrop-blur-xl shadow-lg transition-colors duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
                  style={{
                    boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {/* Subtle top-right corner specular glow */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl ${feat.glowColor} opacity-25 group-hover:opacity-60 transition-opacity pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 ${feat.iconColor} shadow-inner`}
                      >
                        <Icon size={20} />
                      </div>
                      <span
                        className={`text-caption font-mono font-medium px-2 py-0.5 rounded-full border ${feat.badgeColor}`}
                      >
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F8F8F8] group-hover:text-white transition-colors">
                      {feat.title}
                    </h3>
                    <div className="text-caption font-semibold text-[#A8A8A8] mt-0.5 mb-2 font-mono">
                      {feat.subtitle}
                    </div>
                    <p className="text-xs text-[#A8A8A8] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Action Button ("Get Exploit" -> Next Login & registration Page) */}
          <div className="flex flex-col items-center gap-3.5 mt-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#00B887] via-[#00D49A] to-[#38BDF8] hover:brightness-110 active:scale-[0.98] px-8 py-3.5 text-sm font-bold text-[#101018] shadow-[0_4px_24px_rgba(0,184,135,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] cursor-pointer transition-colors duration-200"
            >
              <span>Get Exploit</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {/* Navigation links to Login, Register, Offline */}
            <div className="flex items-center gap-3 text-xs text-[#A8A8A8]">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Already have an account?{" "}
                <span className="text-[#00B887] font-semibold underline underline-offset-2">
                  Log In
                </span>
              </button>
              <span className="text-[#303038]">•</span>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Create Account
              </button>
              {onContinueOffline && (
                <>
                  <span className="text-[#303038]">•</span>
                  <button
                    type="button"
                    onClick={onContinueOffline}
                    className="hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    Continue in Offline Mode →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer status & theme switcher */}
          <div className="mt-2 flex items-center justify-between w-full text-caption text-[#686870] pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <SparklesIcon size={12} className="text-[#00B887]" />
              <span>Deterministic taint analysis. Zero alert fatigue.</span>
            </div>
            <button
              type="button"
              onClick={() => switchMode("theme_pick")}
              title="Choose color theme"
              className="flex items-center gap-1 text-[#A8A8A8] hover:text-[#00B887] transition-colors cursor-pointer"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
              <span>Theme: {currentTheme}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 2. THEME PICKER SCREEN ── */}
      {mode === "theme_pick" && (
        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl py-6 animate-in fade-in duration-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-wide">Choose an editor theme type</h1>
            <p className="text-sm text-[#A8A8A8] mt-1">
              Click or use arrow keys (← or →) to select.
            </p>
          </div>
          <ThemePicker className="w-full" />
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => switchMode("welcome")}
              className="text-sm text-[#A8A8A8] hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Features
            </button>
            <button
              type="button"
              onClick={() => switchMode("welcome")}
              className="flex items-center gap-1.5 rounded-full bg-[#00B887] hover:bg-[#00D49A] px-5 py-2 text-sm font-bold text-[#101018] transition-colors cursor-pointer shadow-md"
            >
              Done ↵
            </button>
          </div>
          {/* Active theme label */}
          <div className="text-xs text-[#A8A8A8]">
            Active theme: <span className="text-[#00B887] font-medium">{currentTheme}</span>
          </div>
        </div>
      )}

      {/* ── 3. AUTH SCREEN (Next: Login & Registration Page) ── */}
      {mode !== "welcome" && mode !== "theme_pick" && (
        <div
          className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[rgba(24,24,32,0.85)] p-7 backdrop-blur-2xl shadow-2xl animate-in fade-in duration-200"
          style={{
            boxShadow:
              "0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
          }}
        >
          {/* Back to Features Showcase Navigation */}
          <button
            type="button"
            onClick={() => switchMode("welcome")}
            className="flex items-center gap-1.5 text-xs text-[#A8A8A8] hover:text-white mb-4 transition-colors cursor-pointer font-medium"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Back to Features</span>
          </button>

          {/* Auth Header with White Circular Logo Emblem */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#101018] shadow-md">
              <CodefyLogo size={24} className="text-[#101018]" />
            </div>
            <div className="text-base font-bold tracking-wide text-white">Codefy</div>
            <div className="text-xs text-[#A8A8A8] text-center">
              {mode === "verify"
                ? "Verify your email to finish creating your account"
                : mode === "forgot_password"
                  ? "Enter your email to receive a password reset code"
                  : mode === "reset_password"
                    ? "Enter the code and set your new password"
                    : "Sign in to start finding real vulnerabilities"}
            </div>
          </div>

          {(mode === "login" || mode === "register") && (
            <div className="mb-5 flex rounded-lg border border-white/10 bg-[#141419] p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  mode === "login"
                    ? "bg-gradient-to-r from-[#00B887] to-[#00D49A] text-[#101018] font-bold shadow-sm"
                    : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  mode === "register"
                    ? "bg-gradient-to-r from-[#00B887] to-[#00D49A] text-[#101018] font-bold shadow-sm"
                    : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "register" && (
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={1}
                  maxLength={100}
                  placeholder="Ada Lovelace"
                  className={inputClass}
                />
              </div>
            )}

            {(mode === "login" || mode === "register" || mode === "forgot_password") && (
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            )}

            {(mode === "login" || mode === "register") && (
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot_password")}
                      className="text-caption text-[#F7931A] hover:underline cursor-pointer mb-1"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                  placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                  className={inputClass}
                />
              </div>
            )}

            {mode === "reset_password" && (
              <>
                <div>
                  <label className={labelClass}>
                    6-digit code sent to <span className="text-[#38BDF8]">{pendingEmail}</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    minLength={6}
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="123456"
                    className={`${inputClass} text-center font-mono text-lg tracking-[0.3em]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className={`${inputClass} pr-8`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-2.5 text-[#A8A8A8] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  className="text-caption text-[#38BDF8] hover:text-white text-left cursor-pointer"
                >
                  Resend code
                </button>
                {resendStatus && (
                  <div className="text-caption text-[#00B887]">{resendStatus}</div>
                )}
              </>
            )}

            {mode === "verify" && (
              <div>
                <label className={labelClass}>
                  6-digit code sent to <span className="text-[#38BDF8]">{pendingEmail}</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  minLength={6}
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="123456"
                  className={`${inputClass} text-center font-mono text-lg tracking-[0.3em]`}
                />
                <button
                  type="button"
                  onClick={handleResend}
                  className="mt-2 text-caption text-[#38BDF8] hover:text-white cursor-pointer"
                >
                  Resend code
                </button>
                {resendStatus && (
                  <div className="mt-1 text-caption text-[#00B887]">{resendStatus}</div>
                )}
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-[#00B887]/30 bg-[rgba(0,184,135,0.12)] px-2.5 py-2 text-caption text-[#00B887]">
                <CheckIcon size={13} className="mt-0.5 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[#E03858]/30 bg-[rgba(224,56,88,0.12)] px-2.5 py-2 text-caption text-[#E03858]">
                <AlertTriangleIcon size={13} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00B887] to-[#00D49A] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-default px-4 py-2.5 text-xs font-bold text-[#101018] shadow-[0_2px_12px_rgba(0,184,135,0.3)] transition-colors cursor-pointer"
            >
              <LockIcon size={13} />
              <span>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Log In"
                    : mode === "register"
                      ? "Create Account"
                      : mode === "verify"
                        ? "Verify & Continue"
                        : mode === "forgot_password"
                          ? "Send Reset Code"
                          : "Reset Password & Log In"}
              </span>
            </button>

            {(mode === "verify" || mode === "forgot_password" || mode === "reset_password") && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-caption text-[#A8A8A8] hover:text-white cursor-pointer text-center"
              >
                ← Back to Log In
              </button>
            )}
          </form>

          {onContinueOffline && (
            <button
              type="button"
              onClick={onContinueOffline}
              className="mt-3.5 w-full text-center text-caption text-[#A8A8A8] hover:text-[#38BDF8] transition-colors cursor-pointer"
            >
              Continue in Offline Mode →
            </button>
          )}

          <div className="mt-5 flex items-center justify-between text-caption text-[#686870] pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <SparklesIcon size={11} className="text-[#00B887]" />
              <span>Deterministic taint analysis.</span>
            </div>
            <button
              type="button"
              onClick={() => switchMode("theme_pick")}
              title="Choose color theme"
              className="flex items-center gap-1 text-[#A8A8A8] hover:text-[#00B887] transition-colors cursor-pointer"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
              <span>Theme</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
