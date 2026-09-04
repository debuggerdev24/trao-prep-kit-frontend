'use client';

import React, { useState } from 'react';
import type { CompanyBrief } from '../../types/kit';
import { Button, Textarea, Badge } from '../ui';

interface CompanyBriefSectionProps {
  brief: CompanyBrief;
  companyUrl: string;
  pagesUsed: string[];
  onChange: (updatedBrief: CompanyBrief) => void;
  onRegenerate: () => Promise<void>;
}

export function CompanyBriefSection({
  brief,
  companyUrl,
  pagesUsed,
  onChange,
  onRegenerate,
}: CompanyBriefSectionProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!confirm('Regenerate company brief? Any unsaved manual edits to this section will be replaced.')) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Company Brief</h2>
          <p className="text-xs text-neutral-400">
            Overview of the company, mission, and products extracted from website crawl.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          loading={isRegenerating}
          loadingText="Regenerating..."
          leftIcon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Regenerate Brief
        </Button>
      </div>

      {/* Summary Field */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Executive Summary
          </label>
          {brief.isEdited && (
            <Badge variant="indigo" size="sm">
              Edited
            </Badge>
          )}
        </div>
        <Textarea
          rows={4}
          value={brief.summary}
          onChange={(e) =>
            onChange({
              ...brief,
              summary: e.target.value,
              item_status: 'edited',
              isEdited: true,
              version: (brief.version || 1) + 1,
            })
          }
          placeholder="Brief company summary..."
        />
      </div>

      {/* What They Do Field */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
        <Textarea
          label="What They Do & Business Model"
          rows={4}
          value={brief.what_they_do}
          onChange={(e) =>
            onChange({
              ...brief,
              what_they_do: e.target.value,
              item_status: 'edited',
              isEdited: true,
              version: (brief.version || 1) + 1,
            })
          }
          placeholder="Detailed breakdown of products, technology, and customers..."
        />
      </div>

      {/* Sources & Crawled Pages */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Research Sources &amp; Crawled Pages
        </h3>
        <p className="text-xs text-neutral-500">
          The following URLs were analyzed to build this company profile:
        </p>
        <div className="flex flex-wrap gap-2">
          {pagesUsed && pagesUsed.length > 0 ? (
            pagesUsed.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-indigo-400 hover:underline flex items-center space-x-1.5 transition"
              >
                <span className="truncate max-w-xs">{url}</span>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))
          ) : (
            <span className="text-xs text-neutral-500 font-mono">{companyUrl}</span>
          )}
        </div>
      </div>
    </div>
  );
}
