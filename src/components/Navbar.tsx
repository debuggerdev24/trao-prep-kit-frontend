'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenCreateKit: () => void;
  onGoHome: () => void;
}

export function Navbar({ onOpenAuth, onOpenCreateKit, onGoHome }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header suppressHydrationWarning className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center space-x-3 text-left group cursor-pointer"
        >
          {/* Authentic Minimalist Monogram / Emblem */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/70 shadow-sm group-hover:border-neutral-500 transition-all duration-200">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M4 6.5h16M12 6.5v12M8 11.5l4-4 4 4"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
          </div>

          {/* Clean Brand Lockup */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-base text-white tracking-tight">Trao</span>
            <span className="text-neutral-600 text-xs select-none">/</span>
            <span className="text-[11px] font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md tracking-wide">
              PrepKit
            </span>
          </div>
        </button>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-3">
          {isMounted && user ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreateKit}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Kit
              </Button>

              <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium truncate max-w-[120px]">{user.name || user.email}</span>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={logout}
                title="Sign out"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAuth}
            >
              Sign In / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
