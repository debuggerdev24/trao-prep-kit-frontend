'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { AuthModal } from '../components/AuthModal';
import { CreateKitModal } from '../components/CreateKitModal';
import { Dashboard } from '../components/Dashboard';
import { GenerationProgress, GENERATION_STEPS } from '../components/GenerationProgress';
import { KitOverview, type BuilderTab } from '../components/builder/KitOverview';
import { CompanyBriefSection } from '../components/builder/CompanyBriefSection';
import { RoleSection } from '../components/builder/RoleSection';
import { QuestionBankSection } from '../components/builder/QuestionBankSection';
import { FlashcardsSection } from '../components/builder/FlashcardsSection';
import { ScheduleSection } from '../components/builder/ScheduleSection';
import { PracticeMode } from '../components/builder/PracticeMode';
import {
  apiListKits,
  apiGenerateKit,
  apiUpdateKit,
  apiDeleteKit,
  apiRegenerateSection,
} from '../lib/api';
import { Alert, Button, Badge } from '../components/ui';
import type { InterviewKit, QuestionCategory } from '../types/kit';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Modals & View States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Kits & Active Selection
  const [kits, setKits] = useState<InterviewKit[]>([]);
  const [isKitsLoading, setIsKitsLoading] = useState(false);
  const [kitsError, setKitsError] = useState<string | null>(null);
  const [selectedKit, setSelectedKit] = useState<InterviewKit | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>('questions');

  // Builder Local Edit State (immediate updates without network roundtrips)
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Generation Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<'generating' | 'completed' | 'partial' | 'failed'>('generating');
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [newlyGeneratedKit, setNewlyGeneratedKit] = useState<InterviewKit | null>(null);

  // Fetch kits when user logs in
  useEffect(() => {
    if (!user) {
      setKits([]);
      setSelectedKit(null);
      return;
    }

    let isMounted = true;
    setIsKitsLoading(true);

    apiListKits()
      .then((res) => {
        if (isMounted) {
          setKits(res.kits || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load kits:', err);
          setKitsError('Failed to load your kits. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsKitsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Kit Selection
  const handleSelectKit = (kit: InterviewKit) => {
    setSelectedKit(JSON.parse(JSON.stringify(kit))); // Deep clone for local editing
    setActiveTab('questions');
    setIsDirty(false);
  };

  // Immediate Local Edit Handler
  const handleUpdateCurrentKit = (updated: Partial<InterviewKit>) => {
    if (!selectedKit) return;
    setSelectedKit({
      ...selectedKit,
      ...updated,
    });
    setIsDirty(true);
  };

  // Persist Local Edits to Backend
  const handleSaveKit = async () => {
    if (!selectedKit || !selectedKit.id) return;
    setIsSaving(true);
    try {
      const res = await apiUpdateKit(selectedKit.id, selectedKit);
      setSelectedKit(res.kit);
      setIsDirty(false);
      // Update in main list
      setKits((prev) => prev.map((k) => (k.id === res.kit.id ? res.kit : k)));
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save kit');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Kit
  const handleDeleteKit = async (id: string) => {
    try {
      await apiDeleteKit(id);
      setKits((prev) => prev.filter((k) => k.id !== id));
      if (selectedKit?.id === id) {
        setSelectedKit(null);
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Warn user before leaving during active generation
  useEffect(() => {
    if (!isGenerating) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isGenerating]);

  // Start Generation Pipeline
  const handleStartGeneration = async (data: { jd: string; company_url: string; days: number }) => {
    if (isGenerating) return;
    setShowCreateModal(false);
    setIsGenerating(true);
    setCurrentStepIndex(0);
    setGenerationStatus('generating');
    setGenerationMessage('Initializing pipeline...');
    setGenerationError(null);
    setNewlyGeneratedKit(null);

    // Simulate stepped progression while waiting for the long-running pipeline
    let step = 0;
    const progressInterval = setInterval(() => {
      if (step < GENERATION_STEPS.length - 2) {
        step++;
        setCurrentStepIndex(step);
        setGenerationMessage(GENERATION_STEPS[step].description);
      }
    }, 4200);

    try {
      const res = await apiGenerateKit(data.jd, data.company_url, data.days);
      clearInterval(progressInterval);

      setCurrentStepIndex(GENERATION_STEPS.length - 1);
      setNewlyGeneratedKit(res.kit);

      // Check if kit was partially generated (has degraded sections)
      const hasUncovered = res.kit.coverage?.uncovered_requirement_ids?.length > 0;
      const hasEmptySections =
        !res.kit.company_brief?.summary ||
        !res.kit.questions?.length ||
        !res.kit.flashcards?.length;

      if (hasUncovered || hasEmptySections) {
        setGenerationStatus('partial');
        setGenerationMessage('Kit generated with some degraded sections. You can regenerate individual sections from the builder.');
      } else {
        setGenerationStatus('completed');
        setGenerationMessage('Interview Preparation Kit generated successfully!');
      }

      // Add to kits list
      setKits((prev) => [res.kit, ...prev]);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setGenerationStatus('failed');
      setGenerationError(err instanceof Error ? err.message : 'Kit generation failed');
    }
  };

  // Section Regeneration Handlers — merge regenerated section with local state
  const [regenError, setRegenError] = useState<string | null>(null);

  const handleRegenerateCompanyBrief = async () => {
    if (!selectedKit || !selectedKit.id) return;
    setRegenError(null);
    try {
      const res = await apiRegenerateSection(selectedKit.id, {
        section: 'company_brief',
        currentKit: selectedKit,
      });
      // Merge: keep local edits to questions/flashcards/schedule, replace only company_brief + source
      setSelectedKit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          company_brief: res.kit.company_brief,
          source: res.kit.source,
        };
      });
      setIsDirty(true);
    } catch (err: unknown) {
      setRegenError(err instanceof Error ? err.message : 'Failed to regenerate company brief');
    }
  };

  const handleRegenerateSchedule = async () => {
    if (!selectedKit || !selectedKit.id) return;
    setRegenError(null);
    try {
      const res = await apiRegenerateSection(selectedKit.id, {
        section: 'schedule',
        currentKit: selectedKit,
      });
      // Merge: keep local edits to questions/flashcards/company_brief, replace only schedule
      setSelectedKit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          schedule: res.kit.schedule,
        };
      });
      setIsDirty(true);
    } catch (err: unknown) {
      setRegenError(err instanceof Error ? err.message : 'Failed to regenerate schedule');
    }
  };

  const handleRegenerateCategory = async (category: QuestionCategory) => {
    if (!selectedKit || !selectedKit.id) return;
    setRegenError(null);
    try {
      const res = await apiRegenerateSection(selectedKit.id, {
        section: 'category',
        category,
        currentKit: selectedKit,
      });
      // Merge: replace questions with backend result, but preserve pinned/edited/custom flags
      const oldQuestions = new Map(selectedKit.questions.map((q) => [q.id, q]));
      const mergedQuestions = res.kit.questions.map((q: InterviewKit['questions'][number]) => {
        const old = oldQuestions.get(q.id);
        return {
          ...q,
          isPinned: old?.isPinned ?? q.isPinned,
          isEdited: old?.isEdited ?? q.isEdited,
          isCustom: old?.isCustom ?? q.isCustom,
        };
      });
      setSelectedKit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: mergedQuestions,
          coverage: res.kit.coverage,
          schedule: res.kit.schedule,
        };
      });
      setIsDirty(true);
    } catch (err: unknown) {
      setRegenError(err instanceof Error ? err.message : 'Failed to regenerate category');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenCreateKit={() => {
          if (!user) {
            setShowAuthModal(true);
          } else {
            setShowCreateModal(true);
          }
        }}
        onGoHome={() => {
          setSelectedKit(null);
          setIsGenerating(false);
        }}
      />

      <main className="flex-1">
        {/* Auth Loading State */}
        {isAuthLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-neutral-400">Loading...</p>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="py-12 px-4">
            <GenerationProgress
              currentStepIndex={currentStepIndex}
              status={generationStatus}
              currentMessage={generationMessage}
              error={generationError}
              onRetry={() => setShowCreateModal(true)}
              onViewKit={() => {
                if (newlyGeneratedKit) {
                  handleSelectKit(newlyGeneratedKit);
                  setIsGenerating(false);
                }
              }}
            />
          </div>
        ) : selectedKit ? (
          /* VIEW 2: Kit Builder & Practice Mode */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <KitOverview
              kit={selectedKit}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              isDirty={isDirty}
              isSaving={isSaving}
              onSave={handleSaveKit}
              onBack={() => {
                if (isDirty && !confirm('You have unsaved changes. Discard and return to dashboard?')) {
                  return;
                }
                setSelectedKit(null);
              }}
            />

            {/* Error Banners */}
            {saveError && (
              <Alert variant="error" onDismiss={() => setSaveError(null)}>
                Save failed: {saveError}
              </Alert>
            )}
            {regenError && (
              <Alert variant="error" onDismiss={() => setRegenError(null)}>
                {regenError}
              </Alert>
            )}

            {/* Tab Contents */}
            <div
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="pt-2"
            >
              {activeTab === 'company_brief' && (
                <CompanyBriefSection
                  brief={selectedKit.company_brief}
                  companyUrl={selectedKit.source.company_url}
                  pagesUsed={selectedKit.source.pages_used}
                  onChange={(updatedBrief) => handleUpdateCurrentKit({ company_brief: updatedBrief })}
                  onRegenerate={handleRegenerateCompanyBrief}
                />
              )}

              {activeTab === 'role' && (
                <RoleSection
                  role={selectedKit.role}
                  questions={selectedKit.questions}
                  onChange={(updatedRole) => handleUpdateCurrentKit({ role: updatedRole })}
                />
              )}

              {activeTab === 'questions' && (
                <QuestionBankSection
                  questions={selectedKit.questions}
                  requirements={selectedKit.role.requirements}
                  onChange={(updatedQuestions) => handleUpdateCurrentKit({ questions: updatedQuestions })}
                  onRegenerateCategory={handleRegenerateCategory}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardsSection
                  flashcards={selectedKit.flashcards}
                  requirements={selectedKit.role.requirements}
                  onChange={(updatedCards) => handleUpdateCurrentKit({ flashcards: updatedCards })}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleSection
                  schedule={selectedKit.schedule}
                  questions={selectedKit.questions}
                  onRegenerateSchedule={handleRegenerateSchedule}
                />
              )}

              {activeTab === 'practice' && (
                <PracticeMode
                  kitId={selectedKit.id}
                  flashcards={selectedKit.flashcards}
                  onExit={() => setActiveTab('questions')}
                />
              )}
            </div>
          </div>
        ) : user ? (
          /* VIEW 3: User Dashboard */
          <>
            {kitsError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Alert
                  variant="error"
                  onDismiss={() => { setKitsError(null); window.location.reload(); }}
                  action={
                    <button
                      onClick={() => { setKitsError(null); window.location.reload(); }}
                      className="underline font-semibold hover:text-white"
                    >
                      Retry
                    </button>
                  }
                >
                  {kitsError}
                </Alert>
              </div>
            )}
            {deleteError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Alert variant="error" onDismiss={() => setDeleteError(null)}>
                  {deleteError}
                </Alert>
              </div>
            )}
            <Dashboard
            kits={kits}
            isLoading={isKitsLoading}
            onSelectKit={handleSelectKit}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onDeleteKit={handleDeleteKit}
            onPracticeKit={(kit) => {
              handleSelectKit(kit);
              setActiveTab('practice');
            }}
          />
          </>
        ) : (
          /* VIEW 4: Unauthenticated Landing Hero */
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8">
            <div className="inline-flex items-center space-x-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium text-neutral-200">Interview Preparation Studio</span>
                <span className="text-neutral-600">/</span>
                <span className="text-neutral-400">v1.0 Release</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
              Turn any job description into a <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                structured interview kit
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Automated requirement extraction, live company research, targeted question banks, and an integer-allocated study schedule built for technical interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowAuthModal(true)}
              >
                Get Started Free &rarr;
              </Button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left border-t border-neutral-800/80">
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Automated Company Crawl</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Discovers what they do and searches for public interview round formats without hardcoded paths.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Deterministic Coverage</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Application logic guarantees every must-have requirement has dedicated questions, using a second pass to close gaps.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Arithmetic Schedule</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Distributes study load across exactly 1 to 60 days with integer minutes and front-loaded hard topics.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CreateKitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleStartGeneration}
        isSubmitting={isGenerating}
      />
    </div>
  );
}
