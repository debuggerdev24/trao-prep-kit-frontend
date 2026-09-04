# AI Interview Prep Kit — Frontend Application

Modern, accessible, and responsive user interface built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS** for the AI Interview Prep Kit.

---

## Features

- **Interactive Kit Builder**: Inline editing for questions, answer outlines, flashcards, and briefs without round-trip lag.
- **Section & Category Regeneration**: Regenerate the company brief, schedule, or an entire question category without clobbering user edits or pinned items.
- **Practice Mode**: Interactive flashcard review with keyboard shortcuts, self-ratings (1–3), and smart **Weak-Spots Prioritization**.
- **Unified Design System**: Fully accessible, senior-level UI component primitives located in `src/components/ui/` (`Button`, `Input`, `Select`, `Textarea`, `Badge`, `Modal`, `Alert`, `Spinner`).
- **Real-Time Generation Progress**: Step-by-step pipeline status indicator with error handling and fallback warnings.
- **Dual Input Modes**: Paste text or upload a `.json` file containing case/role pairs.
- **Full Keyboard Navigation**: Space/Enter/1/2/3 in Practice Mode, Escape and focus trap in Modals.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: React Context (`AuthContext`) and local optimistic builder state
- **HTTP Client**: Native `fetch` with error boundaries and automatic JWT header injection

---

## Project Structure

```text
frontend/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router (pages, layout, globals.css)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main application (Dashboard, Builder, Landing Hero)
│   │   └── globals.css         # Tailwind directives & CSS tokens
│   ├── components/
│   │   ├── ui/                 # Reusable UI component library
│   │   │   ├── Button.tsx      # Polymorphic button with loading, variants, sizes
│   │   │   ├── Input.tsx       # Accessible input with password toggle & validation
│   │   │   ├── Select.tsx      # Custom dropdown with SVG indicator
│   │   │   ├── Textarea.tsx    # Textarea with live character counter
│   │   │   ├── Badge.tsx       # Semantic color badges with dot indicator
│   │   │   ├── Modal.tsx       # Focus-trapped dialog with Escape key handling
│   │   │   ├── Alert.tsx       # Dismissible notification banners
│   │   │   ├── Spinner.tsx     # Animated SVG spinner
│   │   │   └── index.ts        # Barrel export
│   │   ├── builder/            # Kit Builder sections
│   │   │   ├── KitOverview.tsx
│   │   │   ├── RoleSection.tsx
│   │   │   ├── CompanyBriefSection.tsx
│   │   │   ├── QuestionBankSection.tsx
│   │   │   ├── FlashcardsSection.tsx
│   │   │   ├── ScheduleSection.tsx
│   │   │   └── PracticeMode.tsx
│   │   ├── AuthModal.tsx       # Login & Registration modal
│   │   ├── CreateKitModal.tsx  # New kit modal with file upload & sample pre-fill
│   │   ├── Dashboard.tsx       # User kits list, metrics, and search
│   │   ├── GenerationProgress.tsx
│   │   └── Navbar.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication state & JWT session management
│   ├── hooks/
│   │   └── useFocusTrap.ts     # Accessibility focus trapping for modals
│   ├── lib/
│   │   └── api.ts              # Backend API client
│   └── types/
│       └── kit.ts              # Frontend TypeScript definitions
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Deployment (e.g. Vercel)

1. Import this repository into Vercel.
2. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-deployed-backend.com/api`
3. Click **Deploy**. Next.js build will automatically run and output an optimized production bundle.
