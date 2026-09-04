'use client';

import React from 'react';
import type { Role, Question } from '../../types/kit';
import { Input, Badge } from '../ui';

interface RoleSectionProps {
  role: Role;
  questions: Question[];
  onChange: (updatedRole: Role) => void;
}

export function RoleSection({ role, questions, onChange }: RoleSectionProps) {
  // Compute coverage per requirement
  const requirementCoverage = new Map<string, number>();
  for (const q of questions) {
    for (const reqId of q.requirement_ids) {
      requirementCoverage.set(reqId, (requirementCoverage.get(reqId) || 0) + 1);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Role &amp; Extracted Requirements</h2>
        <p className="text-xs text-neutral-400">
          Core qualifications extracted from the job posting, classified by requirement kind and priority.
        </p>
      </div>

      {/* Role Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <Input
            label="Role Title"
            type="text"
            value={role.title}
            onChange={(e) => onChange({ ...role, title: e.target.value })}
          />
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <Input
            label="Seniority Level"
            type="text"
            value={role.seniority}
            onChange={(e) => onChange({ ...role, seniority: e.target.value })}
          />
        </div>
      </div>

      {/* Responsibilities */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Core Responsibilities
        </h3>
        <ul className="space-y-2">
          {role.responsibilities.map((resp, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2 text-xs text-neutral-300 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/60"
            >
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">&bull;</span>
              <span>{resp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements List & Coverage Status */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Job Requirements ({role.requirements.length})
          </h3>
          <span className="text-[11px] text-neutral-500">
            Stable IDs link requirements directly to generated questions
          </span>
        </div>

        <div className="space-y-3">
          {role.requirements.map((req) => {
            const questionCount = requirementCoverage.get(req.id) || 0;
            const isCovered = questionCount > 0;

            const kindVariant =
              req.kind === 'technical'
                ? 'sky'
                : req.kind === 'behavioural'
                ? 'purple'
                : 'emerald';

            const priorityVariant = req.priority === 'must' ? 'rose' : 'neutral';

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <Badge variant="indigo" size="sm">
                      {req.id}
                    </Badge>

                    <Badge variant={kindVariant} size="sm">
                      {req.kind}
                    </Badge>

                    <Badge variant={priorityVariant} size="sm">
                      {req.priority === 'must' ? 'Must Have' : 'Nice to Have'}
                    </Badge>
                  </div>

                  <p className="text-xs text-neutral-200 leading-snug">{req.text}</p>
                </div>

                {/* Question Coverage Indicator */}
                <div className="shrink-0 flex items-center space-x-2">
                  <Badge variant={isCovered ? 'emerald' : 'amber'} size="md" withDot>
                    {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
