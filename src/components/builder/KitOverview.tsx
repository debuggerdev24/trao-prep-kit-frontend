"use client";

import type { InterviewKit } from "../../types/kit";
import { Button, Badge } from "../ui";

export type BuilderTab =
  | "company_brief"
  | "role"
  | "questions"
  | "flashcards"
  | "schedule"
  | "practice";

interface KitOverviewProps {
  kit: InterviewKit;
  activeTab: BuilderTab;
  onSelectTab: (tab: BuilderTab) => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
}

export function KitOverview({
  kit,
  activeTab,
  onSelectTab,
  isDirty,
  isSaving,
  onSave,
  onBack,
}: KitOverviewProps) {
  const uncoveredCount = kit.coverage?.uncovered_requirement_ids?.length || 0;
  const isFullyCovered = uncoveredCount === 0;

  const tabs: { id: BuilderTab; label: string; count?: number }[] = [
    { id: "company_brief", label: "Company Brief" },
    {
      id: "role",
      label: "Role & Requirements",
      count: kit.role?.requirements?.length,
    },
    { id: "questions", label: "Question Bank", count: kit.questions?.length },
    { id: "flashcards", label: "Flashcards", count: kit.flashcards?.length },
    {
      id: "schedule",
      label: "Study Schedule",
      count: kit.schedule?.days?.length,
    },
    { id: "practice", label: "Practice Mode" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          }
        >
          Back to Dashboard
        </Button>

        {/* Save Status & Action */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {isDirty && (
            <span className="text-xs text-amber-400 flex items-center space-x-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved edits</span>
            </span>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            disabled={!isDirty || isSaving}
            loading={isSaving}
            loadingText="Saving..."
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            }
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Kit Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {kit.role?.title || "Target Role"}
              </h1>
              <Badge variant="neutral" size="md">
                {kit.role?.seniority || "Mid"}
              </Badge>
            </div>
            <div className="flex items-center space-x-3 text-xs text-neutral-400 flex-wrap">
              <span className="text-neutral-200 font-medium">
                {kit.source?.company || "Company"}
              </span>
              <span>&bull;</span>
              <a
                href={kit.source?.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>{kit.source?.company_url}</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <span>&bull;</span>
              <span>{kit.source?.location || "Remote"}</span>
            </div>
          </div>

          {/* Badges / Metrics */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              <span className="text-neutral-400">Duration: </span>
              <span className="text-white font-bold font-mono">
                {kit.schedule?.days_available || 5} Days
              </span>
            </div>

            <Badge
              variant={isFullyCovered ? "emerald" : "amber"}
              size="md"
              withDot
            >
              {isFullyCovered
                ? "100% Requirement Coverage"
                : `${uncoveredCount} Uncovered Gap${uncoveredCount > 1 ? "s" : ""}`}
            </Badge>

            <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
              <span>Passes: </span>
              <span className="text-indigo-400 font-bold font-mono">
                {kit.coverage?.passes || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-neutral-800 pb-2"
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${t.id}`}
              onClick={() => onSelectTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
