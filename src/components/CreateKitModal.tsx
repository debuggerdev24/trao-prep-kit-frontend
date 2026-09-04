'use client';

import React, { useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Button, Input, Textarea, Alert, Badge } from './ui';

interface CreateKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { jd: string; company_url: string; days: number }) => void;
  isSubmitting?: boolean;
}

const SAMPLE_JD = `Senior Full-Stack Engineer at Acme Cloud
Location: San Francisco / Remote

About the Role:
We are seeking a Senior Full-Stack Engineer to architect our enterprise collaboration platform. You will lead technical design across our Next.js frontend and Node.js microservices backend.

Responsibilities:
- Build high-performance, real-time web applications with React, Next.js, and TypeScript
- Architect scalable distributed microservices with Node.js and PostgreSQL
- Drive architectural decisions and mentor junior to mid-level engineers
- Collaborate with product managers and designers to deliver customer-facing features

Requirements:
- 5+ years of experience with modern TypeScript, React, and Node.js (Must)
- Deep practical understanding of distributed systems, concurrency, and SQL performance (Must)
- Proven experience mentoring engineers and guiding technical standards (Must)
- Nice to have: Experience with Docker, Kubernetes, and event-driven architectures with Kafka (Bonus)`;

export function CreateKitModal({ isOpen, onClose, onSubmit, isSubmitting = false }: CreateKitModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);
  const [jd, setJd] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [days, setDays] = useState(5);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillSample = () => {
    setJd(SAMPLE_JD);
    setCompanyUrl('https://example.com/acme');
    setDays(5);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const item = parsed[0];
          if (item.jd) setJd(item.jd);
          if (item.company_url) setCompanyUrl(item.company_url);
          if (item.days) setDays(Math.min(Math.max(Number(item.days) || 5, 1), 60));
          setError(null);
        } else if (parsed && typeof parsed === 'object') {
          if (parsed.jd) setJd(parsed.jd);
          if (parsed.company_url) setCompanyUrl(parsed.company_url);
          if (parsed.days) setDays(Math.min(Math.max(Number(parsed.days) || 5, 1), 60));
          setError(null);
        }
      } catch {
        setError('Could not parse JSON file. Ensure it contains valid JD and company URL data.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const trimmedJd = jd.trim();
    const trimmedUrl = companyUrl.trim();

    if (!trimmedJd || trimmedJd.length < 10) {
      setError('Please paste a job description (minimum 10 characters).');
      return;
    }

    if (!trimmedUrl) {
      setError('Please provide the company website URL.');
      return;
    }

    try {
      new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
    } catch {
      setError('Please enter a valid company website URL (e.g. https://company.com).');
      return;
    }

    if (!Number.isInteger(days) || days < 1 || days > 60) {
      setError('Days before interview must be between 1 and 60.');
      return;
    }

    const formattedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    onSubmit({ jd: trimmedJd, company_url: formattedUrl, days });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative text-neutral-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400">
                New Preparation Kit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Create AI Interview Prep Kit
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Paste the job description and company URL. The system will crawl the site, research the interview process, and generate a tailored kit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions: Upload File & Pre-fill Sample */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
          <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800/70 hover:bg-neutral-800 hover:text-white border border-neutral-700/60 transition">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload Cases/Pair File (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleFillSample}
            leftIcon={
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            className="text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 hover:bg-indigo-900/50"
          >
            Pre-fill Sample Data
          </Button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5">
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Website URL */}
          <Input
            label="Company Website URL"
            type="text"
            required
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://company.com"
            helperText="The crawler explores the site to extract what the company does and discover hiring processes."
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            }
          />

          {/* Job Description */}
          <Textarea
            label="Job Description"
            required
            rows={8}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job posting text here (including responsibilities, technical requirements, and qualifications)..."
            helperText={`${jd.length} characters (minimum 10 required)`}
            className="font-mono text-xs"
          />

          {/* Days Available Slider / Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Days Before Interview
              </label>
              <Badge variant="indigo" size="md">
                {days} {days === 1 ? 'day' : 'days'}
              </Badge>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
            {/* Quick selector buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 3, 5, 7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    days === d
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-neutral-800/70 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400">
              The arithmetic scheduler will distribute all must-have topics across exactly {days} days.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              loadingText="Analyzing..."
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              Generate Prep Kit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
