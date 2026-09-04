'use client';

import React, { useState } from 'react';
import type { Schedule, Question } from '../../types/kit';
import { Button, Badge } from '../ui';

interface ScheduleSectionProps {
  schedule: Schedule;
  questions: Question[];
  onRegenerateSchedule: () => Promise<void>;
}

export function ScheduleSection({
  schedule,
  questions,
  onRegenerateSchedule,
}: ScheduleSectionProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const questionMap = new Map<string, Question>(questions.map((q) => [q.id, q]));

  const handleRecalculate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateSchedule();
    } finally {
      setIsRegenerating(false);
    }
  };

  const totalMinutes = schedule.days.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Study Schedule ({schedule.days_available} Days)
          </h2>
          <p className="text-xs text-neutral-400">
            Arithmetic distribution of topics across requested days. Harder topics land earlier.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <span>Total Time: </span>
            <span className="font-bold text-white font-mono">{totalMinutes} mins</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRecalculate}
            loading={isRegenerating}
            loadingText="Recalculating..."
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Recalculate Schedule
          </Button>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-4">
        {schedule.days.map((day) => {
          const dayQuestions = day.question_ids
            .map((id) => questionMap.get(id))
            .filter((q): q is Question => q !== undefined);

          return (
            <div
              key={day.day}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center">
                    D{day.day}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {day.focus}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="indigo" size="sm">
                    {day.minutes} mins
                  </Badge>
                  <span className="text-xs text-neutral-500">
                    {dayQuestions.length} {dayQuestions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>
              </div>

              {/* Day Question Cards */}
              <div className="space-y-2 pt-1">
                {dayQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="indigo" size="sm">
                          {q.id}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {q.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-neutral-500">
                          Diff: {q.difficulty}
                        </span>
                      </div>
                      <p className="text-neutral-200 font-medium leading-snug">{q.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
