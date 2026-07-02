import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useAudio } from '../../hooks/useAudio';

export const LoginPage: React.FC = () => {
  const { playSound } = useAudio();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    playSound('click');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        playSound('success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
      playSound('locked');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    playSound('click');
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed.');
      playSound('locked');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md bg-[var(--bg-main)] border-3 border-[var(--border-color)] rounded-[28px] shadow-lg overflow-hidden p-8 flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-3xl font-[900] text-[var(--color-green)] leading-tight tracking-tight">
            Zero to Modern AI
          </h1>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mt-1">
            Command Deck Portal
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 text-[var(--color-red)] text-sm font-bold border-2 border-[var(--color-red)] rounded-2xl p-4 text-left">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-950/20 text-[var(--color-green)] text-sm font-bold border-2 border-[var(--color-green)] rounded-2xl p-4 text-left">
            ✨ {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4 text-left">
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Display Name
              </label>
              <input
                className="w-full px-4 py-3 bg-[var(--input-bg)] border-2 border-[var(--border-color)] rounded-xl font-bold text-sm text-[var(--text-main)] focus:border-[var(--color-blue)] transition-colors"
                type="text"
                placeholder="e.g. Mayank"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
                maxLength={20}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 bg-[var(--input-bg)] border-2 border-[var(--border-color)] rounded-xl font-bold text-sm text-[var(--text-main)] focus:border-[var(--color-blue)] transition-colors"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-[var(--input-bg)] border-2 border-[var(--border-color)] rounded-xl font-bold text-sm text-[var(--text-main)] focus:border-[var(--color-blue)] transition-colors"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-chunky btn-green text-white font-black"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]"></div>
          </div>
          <span className="relative bg-[var(--bg-main)] px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-faint)]">
            or
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full btn-chunky btn-gray font-black flex items-center justify-center gap-3"
        >
          <svg className="w-5 height-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-sm font-bold text-[var(--text-muted)] mt-2">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              playSound('click');
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-[var(--color-blue)] hover:underline ml-1 focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
