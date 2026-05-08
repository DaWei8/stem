# STEM Coding Standards & Agent Directives

## 1. TECH STACK & ECOSYSTEM

- **Framework**: Next.js 15+ (App Router exclusively).
- **Database / Auth**: Supabase (Primary).
- **Forbidden Tech**: Firebase is strictly forbidden.
- **Styling**: Tailwind CSS (Utility classes only, no inline styles).
- **Validation**: Zod (for forms, API payloads, and database schemas).
- **Icons**: `lucide-react`.
- **State Management**: React Context (Global UI) + Server Components (Data Fetching). Use `Zustand` for complex client state.
- **Animations**: `framer-motion` (Purposeful micro-interactions only).

## 2. ARCHITECTURE & MODULARITY (THE 150-LINE RULE)

- **Component Size Limits**: Target < 150 lines. Hard limit 300 lines.
- **Refactoring**: If a file approaches 200 lines, extract logic into custom hooks or sub-components.
- **Structure**:
  - `src/app/`: Next.js App Router (Pages, Layouts, APIs).
  - `src/components/ui/`: Atoms (Buttons, Inputs, etc.).
  - `src/components/blocks/`: Molecules (Cards, Forms, etc.).
  - `src/components/layout/`: Organisms (Navbars, Footers, etc.).
  - `src/constants/`: Hardcoded values, mock data (No ghost data in components).
  - `src/lib/`: Utility functions, Supabase clients.
  - `src/hooks/`: Custom React hooks.
  - `src/types/`: TypeScript interfaces and Zod schemas.

## 3. UX STATES

- **Loading**: Use `loading.tsx` for route-level and `Suspense` + Skeleton for component-level. No layout-shifting spinners.
- **Error**: Informative, non-destructive, use `error.tsx` for boundaries. Use `Sonner` for toasts.
- **Success**: Instant feedback, Optimistic UI updates where possible.

## 4. ACCESSIBILITY (A11Y)

- Full keyboard navigation.
- Semantic HTML (`<button>` for actions, `<a>` for links).
- `aria-label` for icon-only elements.
- Highly visible focus rings.

## 5. PERFORMANCE

- **Images**: Use `next/image` with explicit width/height.
- **Fonts**: Use `next/font`.
- **Queries**: Define specific columns in Supabase/PostgreSQL. No `SELECT *`.

## 6. DETERMINISTIC SYSTEM DESIGN (STEM SPECIFIC)

- **Variable Registry**: Every data point MUST have an immutable `registry_uuid`.
- **Immutable UUID Pattern**: Internal references use `registry_uuid`, never labels/names.
- **Single Source of Truth**: Database columns, UI inputs, and constraints must all link back to the Variable Registry.
- **Deterministic Pathing**: The system is valid only if every path through the graph is logically sound.

## 7. AGENT WORKFLOW

1. **Analyze & Plan**: State component hierarchy and data flow.
2. **Check for Reuse**: Use existing UI components.
3. **Draft Types First**: Define TS interfaces and Zod schemas.
4. **Build the Skeleton**: Visual placeholders first.
5. **Build the Component**: < 150 lines.
6. **Error Handling**: Try/catch, error boundaries, empty states.
7. **Commit Standards**: Conventional Commits (`feat:`, `fix:`, `ui:`, `refactor:`).
