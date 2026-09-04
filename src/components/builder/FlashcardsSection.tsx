'use client';

import React, { useState } from 'react';
import { Button, Select, Textarea, Badge, Modal } from '../ui';
import type { Flashcard, Requirement } from '../../types/kit';

interface FlashcardsSectionProps {
  flashcards: Flashcard[];
  requirements: Requirement[];
  onChange: (updatedFlashcards: Flashcard[]) => void;
}

export function FlashcardsSection({
  flashcards,
  requirements,
  onChange,
}: FlashcardsSectionProps) {
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New flashcard form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newReqId, setNewReqId] = useState(requirements[0]?.id || 'r1');

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdate = (id: string, partial: Partial<Flashcard>) => {
    const updated = flashcards.map((f) => (f.id === id ? { ...f, ...partial, isEdited: true } : f));
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    const remaining = flashcards.filter((f) => f.id !== id);
    const reindexed = remaining.map((f, idx) => ({ ...f, id: `f${idx + 1}` }));
    onChange(reindexed);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= flashcards.length) return;

    const copy = [...flashcards];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);

    const reindexed = copy.map((f, idx) => ({ ...f, id: `f${idx + 1}` }));
    onChange(reindexed);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `f${flashcards.length + 1}`,
      front: newFront.trim(),
      back: newBack.trim(),
      requirement_ids: [newReqId],
      isCustom: true,
      isPinned: true,
    };

    onChange([...flashcards, newCard]);
    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Flashcards ({flashcards.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Interactive recall cards for key concepts, STAR stories, and rapid revision.
          </p>
        </div>

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
          Add Card
        </Button>
      </div>

      {/* Grid of Flashcards */}
      {flashcards.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-xs">
          No flashcards available in this kit. Click &ldquo;Add Flashcard&rdquo; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {flashcards.map((card, idx) => {
            const isFlipped = !!flippedMap[card.id];

            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-4 transition"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="indigo" size="sm">
                      {card.id}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => toggleFlip(card.id)}
                      leftIcon={
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      }
                    >
                      {isFlipped ? 'View Front' : 'View Back'}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-1 text-neutral-500">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:text-white disabled:opacity-20 transition"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === flashcards.length - 1}
                      className="p-1 rounded hover:text-white disabled:opacity-20 transition"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-1 rounded hover:text-rose-400 transition"
                      title="Delete card"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Card Content (Flip state) */}
                <div className="min-h-[110px] flex flex-col justify-center p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    {isFlipped ? 'Back (Answer Outline)' : 'Front (Prompt / Question)'}
                  </span>
                  {isFlipped ? (
                    <textarea
                      rows={3}
                      value={card.back}
                      onChange={(e) => handleUpdate(card.id, { back: e.target.value })}
                      className="w-full bg-transparent text-xs text-emerald-300 outline-none leading-relaxed resize-none"
                    />
                  ) : (
                    <textarea
                      rows={3}
                      value={card.front}
                      onChange={(e) => handleUpdate(card.id, { front: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-medium outline-none leading-relaxed resize-none"
                    />
                  )}
                </div>

                {/* Footer Requirement Pill */}
                <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                  <span>Linked:</span>
                  {card.requirement_ids.map((rId) => (
                    <span key={rId} className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                      {rId}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Flashcard Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Flashcard"
        maxWidth="md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Textarea
            label="Front (Prompt / Recall Query)"
            required
            rows={2}
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
            placeholder="e.g. React Fiber Architecture core stages..."
          />

          <Textarea
            label="Back (Model Answer / Key Points)"
            required
            rows={3}
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
            placeholder="Key concepts, trade-offs, and examples..."
          />

          <Select
            label="Linked Requirement"
            value={newReqId}
            onChange={(e) => setNewReqId(e.target.value)}
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
              Add Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
