'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Button, Input, Alert } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, user } = useAuth();
  const modalRef = useFocusTrap(isOpen, onClose);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Independent Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Independent Register / Sign-up form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to completely clear all forms
  const resetAll = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setError(null);
  };

  // Reset fields when modal closes or when user logs out (user becomes null)
  useEffect(() => {
    if (!isOpen || !user) {
      resetAll();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSwitchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = tab === 'login' ? loginEmail.trim() : registerEmail.trim();
    const password = tab === 'login' ? loginPassword : registerPassword;
    const name = registerName.trim();

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (tab === 'register' && !name) {
      setError('Name is required for registration');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      resetAll();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative text-neutral-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {tab === 'login'
              ? 'Access your saved personalized interview kits'
              : 'Generate and manage your AI-powered interview prep kits'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-neutral-950 border border-neutral-800">
          <button
            type="button"
            onClick={() => handleSwitchTab('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              tab === 'login'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('register')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              tab === 'register'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4">
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'login' ? (
            /* LOGIN FORM FIELDS */
            <>
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="jane@example.com"
              />

              <Input
                label="Password"
                required
                isPassword
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </>
          ) : (
            /* SIGN UP / REGISTER FORM FIELDS */
            <>
              <Input
                label="Full Name"
                type="text"
                required
                autoComplete="name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Jane Doe"
              />

              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="jane@example.com"
              />

              <Input
                label="Password"
                required
                isPassword
                autoComplete="new-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="•••••••• (min. 6 characters)"
              />
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            loadingText="Processing..."
            className="w-full mt-6"
          >
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
