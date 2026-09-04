'use client';

import React, { useState } from 'react';
import { Button, Select, Textarea, Badge, Modal } from '../ui';
import type { Question, QuestionCategory, QuestionDifficulty, Requirement } from '../../types/kit';

interface QuestionBankSectionProps {
  questions: Question[];
  requirements: Requirement[];
  onChange: (updatedQuestions: Question[]) => void;
  onRegenerateCategory: (category: QuestionCategory) => Promise<void>;
}

const CATEGORIES: { id: QuestionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'technical', label: 'Technical' },
  { id: 'system-design', label: 'System Design' },
  { id: 'behavioural', label: 'Behavioural' },
  { id: 'company-fit', label: 'Company Fit' },
];

export function QuestionBankSection({
  questions,
  requirements,
  onChange,
  onRegenerateCategory,
}: QuestionBankSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('technical');
  const [newDifficulty, setNewDifficulty] = useState<QuestionDifficulty>(2);
  const [newReqIds, setNewReqIds] = useState<string[]>([]);

  const filteredQuestions = questions.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  // Update specific question
  const handleUpdateQuestion = (id: string, partial: Partial<Question>) => {
    const updated = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            ...partial,
            item_status: 'edited' as const,
            isEdited: true,
            version: (q.version || 1) + 1,
          }
        : q
    );
    onChange(updated);
  };

  // Toggle Pin (protects against regeneration)
  const handleTogglePin = (id: string) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, isPinned: !q.isPinned } : q));
    onChange(updated);
  };

  // Reorder up / down
  const handleMove = (indexInFiltered: number, direction: 'up' | 'down') => {
    const targetQ = filteredQuestions[indexInFiltered];
    if (!targetQ) return;

    const actualIndex = questions.findIndex((q) => q.id === targetQ.id);
    if (actualIndex === -1) return;

    const newActualIndex = direction === 'up' ? actualIndex - 1 : actualIndex + 1;
    if (newActualIndex < 0 || newActualIndex >= questions.length) return;

    const copy = [...questions];
    const [moved] = copy.splice(actualIndex, 1);
    copy.splice(newActualIndex, 0, moved);

    // Reassign stable sequential IDs
    const reindexed = copy.map((q, idx) => ({ ...q, id: `q${idx + 1}` }));
    onChange(reindexed);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const remaining = questions.filter((q) => q.id !== id);
    const reindexed = remaining.map((q, idx) => ({ ...q, id: `q${idx + 1}` }));
    onChange(reindexed);
  };

  // Add new question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      requirement_ids: newReqIds.length > 0 ? newReqIds : [requirements[0]?.id || 'r1'],
      category: newCategory,
      prompt: newPrompt.trim(),
      answer_outline: newAnswer.trim() || 'Custom answer outline.',
      difficulty: newDifficulty,
      item_status: 'manual',
      isCustom: true,
      isPinned: true, // Auto-pin custom questions so they survive category regeneration
      version: 1,
    };

    onChange([...questions, newQuestion]);
    setNewPrompt('');
    setNewAnswer('');
    setShowAddModal(false);
  };

  // Trigger Category Regeneration
  const handleRegenerateCurrentCategory = async () => {
    if (selectedCategory === 'all') {
      alert('Please select a specific category tab before regenerating.');
      return;
    }

    const pinnedCount = questions.filter(
      (q) => q.category === selectedCategory && (q.isPinned || q.isEdited || q.isCustom)
    ).length;

    const msg = pinnedCount > 0
      ? `Regenerate unpinned questions in "${selectedCategory}"? ${pinnedCount} pinned/edited question(s) will be strictly preserved.`
      : `Regenerate questions in category "${selectedCategory}"?`;

    if (!confirm(msg)) return;

    setIsRegenerating(true);
    try {
      await onRegenerateCategory(selectedCategory);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Question Bank ({questions.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Inline editable, reorderable questions mapped to specific job requirements.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {selectedCategory !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              loading={isRegenerating}
              loadingText="Regenerating..."
              onClick={handleRegenerateCurrentCategory}
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Regenerate Category
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
        {CATEGORIES.map((cat) => {
          const count =
            cat.id === 'all'
              ? questions.length
              : questions.filter((q) => q.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
                isSelected
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800/80'
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-950 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-xs">
          No questions found in this category. Click &ldquo;Add Question&rdquo; to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const outlineText = Array.isArray(q.answer_outline)
              ? q.answer_outline.join('\n')
              : q.answer_outline;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl bg-neutral-900 border transition ${
                  q.isPinned
                    ? 'border-indigo-800/80 bg-neutral-900/90 shadow-md shadow-indigo-950/20'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                      {q.id}
                    </span>

                    {/* Category Selector / Pill */}
                    <div className="w-36">
                      <Select
                        selectSize="sm"
                        value={q.category}
                        onChange={(e) =>
                          handleUpdateQuestion(q.id, {
                            category: e.target.value as QuestionCategory,
                          })
                        }
                        options={[
                          { value: 'technical', label: 'Technical' },
                          { value: 'system-design', label: 'System Design' },
                          { value: 'behavioural', label: 'Behavioural' },
                          { value: 'company-fit', label: 'Company Fit' },
                        ]}
                      />
                    </div>

                    {/* Difficulty Pill */}
                    <div className="w-36">
                      <Select
                        selectSize="sm"
                        value={q.difficulty}
                        onChange={(e) =>
                          handleUpdateQuestion(q.id, {
                            difficulty: Number(e.target.value) as QuestionDifficulty,
                          })
                        }
                        options={[
                          { value: 1, label: 'Level 1 · Basic' },
                          { value: 2, label: 'Level 2 · Moderate' },
                          { value: 3, label: 'Level 3 · Hard' },
                        ]}
                      />
                    </div>

                    {/* Pinned Indicator */}
                    {q.isPinned && (
                      <Badge variant="indigo" size="sm" dot>
                        Pinned
                      </Badge>
                    )}

                    {/* Edited Indicator */}
                    {q.isEdited && (
                      <Badge variant="amber" size="sm" dot>
                        Edited
                      </Badge>
                    )}
                  </div>

                  {/* Actions: Reorder & Pin & Delete */}
                  <div className="flex items-center space-x-1 text-neutral-400">
                    {/* Pin toggle button */}
                    <button
                      onClick={() => handleTogglePin(q.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        q.isPinned
                          ? 'text-indigo-400 bg-indigo-950/80 hover:bg-indigo-900'
                          : 'hover:text-white hover:bg-neutral-800'
                      }`}
                      title={q.isPinned ? 'Unpin question' : 'Pin question (survives category regeneration)'}
                    >
                      <svg className="w-4 h-4" fill={q.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move question earlier in schedule"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === filteredQuestions.length - 1}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move question later in schedule"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                      title="Delete question"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Question Prompt (Inline editable) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Question Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-sm text-neutral-100 outline-none leading-relaxed transition resize-y font-medium"
                  />
                </div>

                {/* Answer Outline (Inline editable) */}
                <div className="space-y-1.5 mt-3">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Answer Outline &amp; Key Focus Points
                  </label>
                  <textarea
                    rows={2}
                    value={outlineText}
                    onChange={(e) =>
                      handleUpdateQuestion(q.id, {
                        answer_outline: e.target.value.includes('\n')
                          ? e.target.value.split('\n').filter((l) => l.trim())
                          : e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-xs text-neutral-300 outline-none leading-relaxed transition resize-y"
                  />
                </div>

                {/* Linked Requirements */}
                <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-neutral-800/60 text-xs">
                  <span className="text-neutral-500 font-medium">Covers:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {q.requirement_ids.map((reqId) => {
                      const reqObj = requirements.find((r) => r.id === reqId);
                      return (
                        <span
                          key={reqId}
                          title={reqObj?.text || reqId}
                          className="px-2 py-0.5 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-[11px] text-neutral-300 font-mono"
                        >
                          {reqId} {reqObj ? `(${reqObj.text.slice(0, 25)}...)` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Question Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Question"
        maxWidth="lg"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <Textarea
            label="Question Prompt"
            required
            rows={3}
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Type the interview question here..."
          />

          <Textarea
            label="Answer Outline"
            rows={2}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Key talking points or model answer..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
            >
              <option value="technical">Technical</option>
              <option value="system-design">System Design</option>
              <option value="behavioural">Behavioural</option>
              <option value="company-fit">Company Fit</option>
            </Select>

            <Select
              label="Difficulty"
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(Number(e.target.value) as QuestionDifficulty)}
            >
              <option value={1}>1 (Basic)</option>
              <option value={2}>2 (Moderate)</option>
              <option value={3}>3 (Advanced)</option>
            </Select>
          </div>

          <Select
            label="Linked Requirement"
            value={newReqIds[0] || (requirements[0]?.id || 'r1')}
            onChange={(e) => setNewReqIds([e.target.value])}
          >
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.id}] {r.text.slice(0, 45)}...
              </option>
            ))}
          </Select>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Add Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
