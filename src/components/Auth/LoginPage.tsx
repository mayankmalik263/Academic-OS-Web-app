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
