'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Flashcard } from '../../types/kit';
import {
  apiGetPracticeProgress,
  apiSavePracticeProgress,
  type PracticeProgressSummary,
} from '../../lib/api';
import { Button, Badge } from '../ui';

interface PracticeModeProps {
  kitId?: string;
  flashcards: Flashcard[];
  onExit?: () => void;
}

export type ConfidenceLevel = 1 | 2 | 3; // 1: Need Review (Low), 2: Good (Medium), 3: Mastered (High)

export function PracticeMode({ kitId, flashcards, onExit }: PracticeModeProps) {
  const [deck, setDeck] = useState<Flashcard[]>([...flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceLevel>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [progressSummary, setProgressSummary] = useState<PracticeProgressSummary | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved progress & weak-spot card ordering from backend
  useEffect(() => {
    if (!kitId) return;

    let isMounted = true;
    setIsLoadingProgress(true);

    apiGetPracticeProgress(kitId)
      .then((summary) => {
        if (!isMounted) return;
        setProgressSummary(summary);

        // Pre-populate saved ratings
        const initialRatings: Record<string, ConfidenceLevel> = {};
        for (const [cId, data] of Object.entries(summary.cardRatings)) {
          initialRatings[cId] = data.rating;
        }
        setConfidenceRatings(initialRatings);

        // Order deck by weak spots if server provided recommended order
        if (summary.recommendedCardOrder && summary.recommendedCardOrder.length > 0) {
          const cardMap = new Map(flashcards.map((f) => [f.id, f]));
          const orderedDeck = summary.recommendedCardOrder
            .map((id) => cardMap.get(id))
            .filter((f): f is Flashcard => f !== undefined);

          // Append any unmapped cards
          for (const f of flashcards) {
            if (!summary.recommendedCardOrder.includes(f.id)) {
              orderedDeck.push(f);
            }
          }
          if (orderedDeck.length > 0) {
            setDeck(orderedDeck);
          }
        }
      })
      .catch((err) => {
        if (isMounted) console.error('Failed to load practice progress:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingProgress(false);
      });

    return () => {
      isMounted = false;
    };
  }, [kitId, flashcards]);

  const currentCard = deck[currentIndex];

  // Persist rating to backend
  const persistRating = useCallback(
    async (cardId: string, rating: ConfidenceLevel) => {
      if (!kitId) return;
      setIsSaving(true);
      try {
        const updated = await apiSavePracticeProgress(kitId, [
          { cardId, confidence: rating },
        ]);
        setProgressSummary(updated);
      } catch (err) {
        console.error('Failed to save practice rating:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [kitId]
  );

  const handleRate = useCallback(
    (confidence: ConfidenceLevel) => {
      if (!currentCard) return;

      setConfidenceRatings((prev) => ({
        ...prev,
        [currentCard.id]: confidence,
      }));

      // Persist rating to API
      persistRating(currentCard.id, confidence);

      setIsRevealed(false);
      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsComplete(true);
      }
    },
    [currentCard, currentIndex, deck.length, persistRating]
  );

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRestart = (reorderWeakSpots: boolean) => {
    if (reorderWeakSpots && progressSummary?.recommendedCardOrder) {
      const cardMap = new Map(flashcards.map((f) => [f.id, f]));
      const orderedDeck = progressSummary.recommendedCardOrder
        .map((id) => cardMap.get(id))
        .filter((f): f is Flashcard => f !== undefined);

      for (const f of flashcards) {
        if (!progressSummary.recommendedCardOrder.includes(f.id)) {
          orderedDeck.push(f);
        }
      }
      setDeck(orderedDeck);
    } else {
      setDeck([...flashcards]);
    }
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsComplete(false);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        }
      } else if (isRevealed) {
        if (e.key === '1') {
          handleRate(1);
        } else if (e.key === '2') {
          handleRate(2);
        } else if (e.key === '3') {
          handleRate(3);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComplete, isRevealed, handleRate]);

  if (isLoadingProgress) {
    return (
      <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm">Loading practice progress...</p>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <p className="text-neutral-400 text-sm">No flashcards available in this kit for practice.</p>
        {onExit && (
          <Button variant="secondary" size="sm" onClick={onExit}>
            Exit Practice Mode
          </Button>
        )}
      </div>
    );
  }

  // Completion Summary Screen
  if (isComplete) {
    const needReviewCount = Object.values(confidenceRatings).filter((r) => r === 1).length;
    const goodCount = Object.values(confidenceRatings).filter((r) => r === 2).length;
    const masteredCount = Object.values(confidenceRatings).filter((r) => r === 3).length;

    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Practice Session Complete!</h2>
          <p className="text-xs text-neutral-400 mt-1">
            You reviewed {deck.length} flashcards. All ratings are automatically saved to your account.
          </p>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-center">
            <span className="text-xl font-bold text-amber-400 font-mono">{needReviewCount}</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Need Review (Low)</p>
          </div>
          <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/50 text-center">
            <span className="text-xl font-bold text-sky-400 font-mono">{goodCount}</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Good (Medium)</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-center">
            <span className="text-xl font-bold text-emerald-400 font-mono">{masteredCount}</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Mastered (High)</p>
          </div>
        </div>

        {/* Cumulative Stats Badge */}
        {progressSummary && (
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>Total Completed Sessions:</span>
            <span className="font-mono font-bold text-indigo-400">{progressSummary.totalSessions}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-800">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleRestart(true)}
          >
            Review Weak Spots (Least Confident First)
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleRestart(false)}
          >
            Restart Entire Deck
          </Button>
        </div>
      </div>
    );
  }

  // Covered and Remaining Counts
  const totalCardsCount = flashcards.length;
  const coveredCardsCount = Object.keys(confidenceRatings).length;
  const remainingCardsCount = Math.max(0, totalCardsCount - coveredCardsCount);
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Coverage Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center space-x-2.5">
          <span className="font-bold text-white tracking-tight text-sm">Practice Mode</span>
          <span>&bull;</span>
          <span>Card {currentIndex + 1} of {deck.length}</span>
          {isSaving && (
            <span className="text-[11px] text-indigo-400 animate-pulse font-mono">Saving...</span>
          )}
        </div>

        {/* Covered vs Remaining Badges */}
        <div className="flex items-center space-x-2">
          <Badge variant="emerald" size="sm">
            Covered: {coveredCardsCount}/{totalCardsCount}
          </Badge>
          <Badge variant="neutral" size="sm">
            Remaining: {remainingCardsCount}
          </Badge>
          {onExit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onExit}
            >
              Exit
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard Card Container */}
      <div className="min-h-[300px] p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col justify-between space-y-6 relative text-neutral-100">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="indigo" size="sm">
              {currentCard?.id}
            </Badge>
            {confidenceRatings[currentCard?.id] && (
              <Badge variant="neutral" size="sm">
                Last Rating: {confidenceRatings[currentCard.id] === 1 ? 'Low' : confidenceRatings[currentCard.id] === 2 ? 'Medium' : 'High'}
              </Badge>
            )}
          </div>

          <span className="text-[11px] text-neutral-500">
            {isRevealed ? 'Answer Outline' : 'Click card or press Space to reveal'}
          </span>
        </div>

        {/* Front / Prompt */}
        <div
          onClick={handleReveal}
          className={`space-y-4 text-center my-auto cursor-pointer ${!isRevealed ? 'hover:opacity-90' : ''}`}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {currentCard?.front}
          </h3>

          {/* Revealed Back */}
          {isRevealed && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 text-sm text-emerald-300 font-normal leading-relaxed text-left animate-in fade-in duration-200">
              {currentCard?.back}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-neutral-800/80">
          {!isRevealed ? (
            <button
              onClick={handleReveal}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Reveal Answer (Space / Enter)</span>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-center text-neutral-400 font-medium">
                Rate your confidence for this card (press 1, 2, or 3):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRate(1)}
                  className="py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 font-semibold text-xs border border-amber-800/60 transition cursor-pointer"
                >
                  Need Review (1)
                </button>
                <button
                  onClick={() => handleRate(2)}
                  className="py-2.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 font-semibold text-xs border border-sky-800/60 transition cursor-pointer"
                >
                  Good (2)
                </button>
                <button
                  onClick={() => handleRate(3)}
                  className="py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 font-semibold text-xs border border-emerald-800/60 transition cursor-pointer"
                >
                  Mastered (3)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
