'use client';

import React, { useState } from 'react';
import type { InterviewKit } from '../types/kit';
import { Button, Input, Badge, Spinner } from './ui';

interface DashboardProps {
  kits: InterviewKit[];
  isLoading: boolean;
  onSelectKit: (kit: InterviewKit) => void;
  onOpenCreateModal: () => void;
  onDeleteKit: (id: string) => Promise<void>;
  onPracticeKit: (kit: InterviewKit) => void;
}

export function Dashboard({
  kits,
  isLoading,
  onSelectKit,
  onOpenCreateModal,
  onDeleteKit,
  onPracticeKit,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredKits = kits.filter((kit) => {
    const term = searchQuery.toLowerCase();
    const role = kit.role?.title?.toLowerCase() || '';
    const company = kit.source?.company?.toLowerCase() || '';
    return role.includes(term) || company.includes(term);
  });

  const totalQuestions = kits.reduce((acc, k) => acc + (k.questions?.length || 0), 0);
  const totalFlashcards = kits.reduce((acc, k) => acc + (k.flashcards?.length || 0), 0);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this kit?')) return;
    setDeletingId(id);
    try {
      await onDeleteKit(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Interview Prep Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage your tailored interview kits, practice flashcards, and review study schedules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreateModal}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Create New Kit
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{kits.length}</span>
            <p className="text-xs text-neutral-400">Total Prep Kits</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{totalQuestions}</span>
            <p className="text-xs text-neutral-400">Questions Prepared</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{totalFlashcards}</span>
            <p className="text-xs text-neutral-400">Flashcards Available</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by role title or company name..."
          leftIcon={
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Kits List / Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-neutral-400">
          <Spinner size="lg" color="indigo" className="mx-auto mb-3" />
          <p className="text-xs">Loading your interview preparation kits...</p>
        </div>
      ) : filteredKits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No interview kits found</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No kits match your search query.' : 'Create your first kit by pasting a job description and company URL.'}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onOpenCreateModal}>
            Create First Kit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKits.map((kit) => (
            <div
              key={kit.id || kit.source.researched_at}
              onClick={() => onSelectKit(kit)}
              className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 hover:shadow-xl transition flex flex-col justify-between cursor-pointer group space-y-4"
            >
              <div className="space-y-3">
                {/* Badge Row */}
                <div className="flex items-center justify-between">
                  <Badge variant="indigo" size="sm">
                    {kit.schedule?.days_available || 5} Days Prep
                  </Badge>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] text-neutral-500">
                      {kit.coverage?.passes || 1} {kit.coverage?.passes === 1 ? 'pass' : 'passes'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Role Title & Company */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {kit.role?.title || 'Target Role'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium line-clamp-1 mt-0.5">
                    {kit.source?.company || 'Company'}
                  </p>
                </div>

                {/* Brief preview */}
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {kit.company_brief?.summary || kit.company_brief?.what_they_do || 'Company overview extracted from website.'}
                </p>
              </div>

              {/* Footer Stats & Actions */}
              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center space-x-3 text-[11px]">
                  <span>{kit.questions?.length || 0} Qs</span>
                  <span>&bull;</span>
                  <span>{kit.flashcards?.length || 0} Cards</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPracticeKit(kit);
                    }}
                  >
                    Practice
                  </Button>

                  {kit.id && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => handleDelete(kit.id!, e)}
                      loading={deletingId === kit.id}
                      className="text-neutral-500 hover:text-rose-400 p-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
