'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated gradient background */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      {/* Card */}
      <main className="login-card" role="main">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 48 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-6">
              <text x="0" y="16" fontSize="18" fontWeight="900" fill="white" fontFamily="Arial, sans-serif" letterSpacing="-0.5">BYD</text>
            </svg>
          </div>
          <div className="login-brand__text">
            <h1 className="login-brand__title">Sales Floor OS</h1>
            <p className="login-brand__sub">Melbourne CBD · Harmony Auto Group</p>
          </div>
        </div>

        <div className="login-divider" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <p className="login-form__heading">Sign in to your account</p>

          {/* Error banner */}
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="login-field">
            <label htmlFor="login-email" className="login-field__label">
              Email address
            </label>
            <div className="login-field__wrap">
              <Mail className="login-field__icon" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@byd.com"
                className="login-field__input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-field__label">
              Password
            </label>
            <div className="login-field__wrap">
              <Lock className="login-field__icon" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-field__input login-field__input--pw"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="login-field__toggle"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="login-submit"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          BYD Harmony Sales Floor · Secure Portal
          <span className="login-footer__dot" />
          v2.0
        </p>
      </main>

      <style>{`
        /* ── Root ── */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0d14;
          position: relative;
          overflow: hidden;
          font-family: 'Manrope', system-ui, sans-serif;
          padding: 1rem;
        }

        /* ── Animated Background ── */
        .login-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .login-bg__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: orbFloat 12s ease-in-out infinite;
        }
        .login-bg__orb--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #3b82f6 0%, #1d4ed8 60%, transparent 100%);
          top: -150px; right: -150px;
          animation-delay: 0s;
        }
        .login-bg__orb--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #8b5cf6 0%, #6d28d9 60%, transparent 100%);
          bottom: -100px; left: -100px;
          animation-delay: -4s;
        }
        .login-bg__orb--3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #06b6d4 0%, #0284c7 60%, transparent 100%);
          top: 40%; left: 30%;
          animation-delay: -8s;
          opacity: 0.12;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -30px) scale(1.05); }
          66%       { transform: translate(-15px, 20px) scale(0.97); }
        }

        /* ── Card ── */
        .login-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: rgba(15, 20, 32, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.1),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(59,130,246,0.04) inset;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Brand ── */
        .login-brand {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .login-logo {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 24px rgba(59,130,246,0.4);
        }
        .login-brand__text { flex: 1; }
        .login-brand__title {
          font-size: 1.1rem; font-weight: 700;
          color: #fff; letter-spacing: -0.02em;
          margin: 0 0 2px;
        }
        .login-brand__sub {
          font-size: 0.72rem; color: #64748b;
          letter-spacing: 0.04em; text-transform: uppercase;
          margin: 0;
        }

        /* ── Divider ── */
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin-bottom: 1.75rem;
        }

        /* ── Form ── */
        .login-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .login-form__heading {
          font-size: 0.85rem; color: #94a3b8;
          margin: 0 0 0.25rem; font-weight: 500;
        }

        /* ── Error banner ── */
        .login-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          color: #fca5a5;
          font-size: 0.82rem; font-weight: 500;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }

        /* ── Fields ── */
        .login-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .login-field__label {
          font-size: 0.78rem; font-weight: 600; color: #94a3b8;
          letter-spacing: 0.03em; text-transform: uppercase;
        }
        .login-field__wrap {
          position: relative; display: flex; align-items: center;
        }
        .login-field__icon {
          position: absolute; left: 0.9rem;
          width: 15px; height: 15px; color: #475569;
          pointer-events: none; flex-shrink: 0;
        }
        .login-field__input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.75rem 0.9rem 0.75rem 2.5rem;
          color: #f1f5f9;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }
        .login-field__input--pw { padding-right: 2.8rem; }
        .login-field__input::placeholder { color: #334155; }
        .login-field__input:focus {
          border-color: rgba(59,130,246,0.6);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .login-field__input:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-field__toggle {
          position: absolute; right: 0.9rem;
          background: none; border: none; cursor: pointer;
          color: #475569; display: flex; padding: 0;
          transition: color 0.15s;
        }
        .login-field__toggle:hover { color: #94a3b8; }

        /* ── Submit ── */
        .login-submit {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border: none; border-radius: 10px;
          color: #fff; font-size: 0.9rem; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(59,130,246,0.45);
        }
        .login-submit:active:not(:disabled) { transform: translateY(0); }
        .login-submit:disabled {
          opacity: 0.4; cursor: not-allowed;
          box-shadow: none;
        }

        /* ── Footer ── */
        .login-footer {
          margin-top: 1.75rem; text-align: center;
          font-size: 0.72rem; color: #334155;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
        }
        .login-footer__dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #334155; display: inline-block;
        }
      `}</style>
    </div>
  );
}
