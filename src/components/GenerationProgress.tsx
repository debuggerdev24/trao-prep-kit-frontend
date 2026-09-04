'use client';

import React from 'react';
import { Button } from './ui';

export interface ProgressStepItem {
  id: string;
  title: string;
  description: string;
}

export const GENERATION_STEPS: ProgressStepItem[] = [
  {
    id: 'extracting_requirements',
    title: 'Extracting Requirements',
    description: 'Analyzing job description for technical and behavioural qualifications.',
  },
  {
    id: 'researching_company',
    title: 'Researching Company',
    description: 'Crawling public website for company mission, products, and tech stack.',
  },
  {
    id: 'finding_hiring_info',
    title: 'Finding Hiring Information',
    description: 'Scanning career pages, engineering blogs, and team handbooks.',
  },
  {
    id: 'searching_interview_info',
    title: 'Researching Interview Process',
    description: 'Retrieving public discussion and detected interview round structures.',
  },
  {
    id: 'generating_questions',
    title: 'Generating Questions',
    description: 'Crafting targeted questions grounded strictly in validated requirements.',
  },
  {
    id: 'checking_coverage',
    title: 'Checking Coverage',
    description: 'Running deterministic application check to identify unaddressed requirements.',
  },
  {
    id: 'filling_coverage_gaps',
    title: 'Filling Coverage Gaps',
    description: 'Executing targeted second pass to close any missing must-have requirements.',
  },
  {
    id: 'generating_flashcards',
    title: 'Generating Flashcards',
    description: 'Synthesizing interactive flashcard recall pairs for practice mode.',
  },
  {
    id: 'creating_schedule',
    title: 'Creating Study Schedule',
    description: 'Allocating integer-minute topics across requested days (harder first).',
  },
  {
    id: 'validating',
    title: 'Final Contract Validation',
    description: 'Enforcing Appendix A schema constraints and referential integrity.',
  },
];

interface GenerationProgressProps {
  currentStepIndex: number;
  status: 'generating' | 'completed' | 'partial' | 'failed';
  currentMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  onViewKit?: () => void;
}

export function GenerationProgress({
  currentStepIndex,
  status,
  currentMessage,
  error,
  onRetry,
  onViewKit,
}: GenerationProgressProps) {
  const percent = Math.min(100, Math.round(((currentStepIndex + 1) / GENERATION_STEPS.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            {status === 'generating' && (
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
            {status === 'completed' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            )}
            {status === 'partial' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            {status === 'failed' && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            )}
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
              {status === 'generating' && 'Pipeline In Progress'}
              {status === 'completed' && 'Kit Ready'}
              {status === 'partial' && 'Kit Ready (Partial)'}
              {status === 'failed' && 'Generation Interrupted'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {status === 'generating' && 'Synthesizing Interview Prep Kit'}
            {status === 'completed' && 'Your Preparation Kit is Ready!'}
            {status === 'partial' && 'Kit Ready — Some Sections Need Attention'}
            {status === 'failed' && 'Generation Failed'}
          </h2>
        </div>

        <div className="text-right">
          <span className="font-mono text-2xl font-bold text-indigo-400">
            {status === 'completed' ? '100%' : `${percent}%`}
          </span>
          <p className="text-[11px] text-neutral-500">
            Step {Math.min(currentStepIndex + 1, GENERATION_STEPS.length)} of {GENERATION_STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mb-6 border border-neutral-800">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            status === 'failed'
              ? 'bg-rose-500'
              : status === 'completed'
              ? 'bg-emerald-500'
              : status === 'partial'
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
          }`}
          style={{ width: `${status === 'completed' || status === 'partial' ? 100 : percent}%` }}
        />
      </div>

      {/* Live Stage Message */}
      {currentMessage && status === 'generating' && (
        <div className="p-3 mb-6 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center space-x-3 truncate">
            <svg className="w-4 h-4 animate-spin text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="truncate">{currentMessage}</span>
          </div>
          <span className="text-[11px] text-neutral-400 shrink-0 font-mono pl-3 hidden sm:inline">
            Deep AI &amp; Crawl (~35–60s)
          </span>
        </div>
      )}

      {/* Error Card */}
      {status === 'failed' && (
        <div className="p-4 mb-6 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-rose-300">Generation Error</p>
              <p className="mt-0.5 text-rose-300/90">{error || 'An unexpected error occurred during generation.'}</p>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
            >
              Retry Generation
            </Button>
          )}
        </div>
      )}

      {/* Success CTA */}
      {(status === 'completed' || status === 'partial') && onViewKit && (
        <div className={`p-4 mb-6 rounded-xl flex items-center justify-between ${
          status === 'partial'
            ? 'bg-amber-950/50 border border-amber-800/80'
            : 'bg-emerald-950/50 border border-emerald-800/80'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status === 'partial'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {status === 'partial' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${status === 'partial' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {status === 'partial' ? 'Kit Generated with Degraded Sections' : 'Kit Successfully Generated'}
              </p>
              <p className="text-xs text-neutral-400">
                {status === 'partial'
                  ? 'Some sections may need regeneration. You can fix them in the builder.'
                  : 'All must-have requirements validated & scheduled.'}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onViewKit}
          >
            Open in Builder &rarr;
          </Button>
        </div>
      )}

      {/* Step Breakdown List */}
      <div className="space-y-3">
        {GENERATION_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex || status === 'completed';
          const isActive = idx === currentStepIndex && status === 'generating';
          const isFailedStep = idx === currentStepIndex && status === 'failed';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3.5 ${
                isActive
                  ? 'bg-neutral-800/80 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : isDone
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-90'
                  : isFailedStep
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : 'bg-neutral-950/20 border-neutral-800/30 opacity-40'
              }`}
            >
              {/* Step Status Icon */}
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500 animate-spin">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : isFailedStep ? (
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-semibold ${
                      isActive ? 'text-indigo-300' : isDone ? 'text-neutral-200' : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isActive && (
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
