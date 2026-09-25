'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
            <img
              src="/images/good-showroom-mark.png"
              alt="Good Showroom"
              className="w-10 h-10 object-contain"
            />
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
          background: #090c12;
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
          filter: blur(90px);
          opacity: 0.28;
          animation: orbFloat 12s ease-in-out infinite;
        }
        .login-bg__orb--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #e60012 0%, #80000a 60%, transparent 100%);
          top: -150px; right: -150px;
          animation-delay: 0s;
        }
        .login-bg__orb--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #171b22 0%, #000000 80%, transparent 100%);
          bottom: -100px; left: -100px;
          animation-delay: -4s;
        }
        .login-bg__orb--3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ff1a2a 0%, #b3000e 60%, transparent 100%);
          top: 40%; left: 30%;
          animation-delay: -8s;
          opacity: 0.15;
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
          background: rgba(23, 27, 34, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(230, 0, 18, 0.2),
            0 32px 80px rgba(0,0,0,0.7),
            0 0 100px rgba(230, 0, 18, 0.06) inset;
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
          background: #ffffff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 6px;
        }
        .login-brand__text { flex: 1; }
        .login-brand__title {
          font-size: 1.1rem; font-weight: 700;
          color: #fff; letter-spacing: -0.02em;
          margin: 0 0 2px;
        }
        .login-brand__sub {
          font-size: 0.72rem; color: #94a3b8;
          letter-spacing: 0.04em; text-transform: uppercase;
          margin: 0;
        }

        /* ── Divider ── */
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(230, 0, 18, 0.3), transparent);
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
          width: 15px; height: 15px; color: #64748b;
          pointer-events: none; flex-shrink: 0; z-index: 5;
        }
        .login-field__input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 0.75rem 0.9rem 0.75rem 2.5rem;
          color: #f1f5f9;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }
        .login-field__input--pw { padding-right: 2.8rem; }
        .login-field__input::placeholder { color: #475569; }
        .login-field__input:focus {
          border-color: #e60012;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 3px rgba(230, 0, 18, 0.2);
        }
        .login-field__input:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-field__toggle {
          position: absolute; right: 0.9rem;
          background: none; border: none; cursor: pointer;
          color: #64748b; display: flex; padding: 0;
          transition: color 0.15s; z-index: 10;
        }
        .login-field__toggle:hover { color: #94a3b8; }

        /* ── Submit ── */
        .login-submit {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, #e60012, #b3000e);
          border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px;
          color: #fff; font-size: 0.9rem; font-weight: 700;
          font-family: inherit; cursor: pointer;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(230, 0, 18, 0.4);
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
        }
        .login-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff1a2a, #cc0010);
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(230, 0, 18, 0.55);
        }
        .login-submit:active:not(:disabled) { transform: translateY(0); }
        .login-submit:disabled {
          opacity: 0.4; cursor: not-allowed;
          box-shadow: none;
        }

        /* ── Footer ── */
        .login-footer {
          margin-top: 1.75rem; text-align: center;
          font-size: 0.72rem; color: #475569;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
        }
        .login-footer__dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #475569; display: inline-block;
        }
      `}</style>
    </div>
  );
}
