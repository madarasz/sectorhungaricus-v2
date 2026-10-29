# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev:cms` - Start both Next.js dev server and CMS proxy (recommended for development)
- `npm run dev` - Start Next.js dev server only (localhost:3000)
- `npm run cms` - Start Decap CMS proxy server only (port 8081)
- `npm run build` - Build static site for production (outputs to `out/`)
- `npm run lint` - Run ESLint

### Testing
- `npm run test` - Run Playwright e2e tests (headless, Chromium only)

### CMS Access
- Local development: http://localhost:3000/admin/index.html (no authentication)

## Architecture Overview

### Static Site with Git-based CMS
This is a **static Next.js site** using **static export** (`output: 'export'`) with a **Git-based CMS** (Decap CMS). Content is stored as Markdown files in the `content/` directory, not in a database.

### Content Architecture
The site the following content collections managed through the CMS:

1. **Games** (`content/games/`) - Gaming information with multilingual support
2. **Pages** (`content/pages/`) - General site pages

### Multilingual Content System
- **Structure**: Multiple files approach (`game-name.en.md`, `game-name.hu.md`)
- **Locales**: English (en) as default, Hungarian (hu)
- **Processing**: Handled via `getMarkdownContent(collection, slug, locale)` in `src/lib/markdown.ts`

### Key Processing Flow
1. **Content Creation**: CMS writes Markdown files to `content/` folders
2. **Build-time Processing**: `src/lib/markdown.ts` processes Markdown with frontmatter using `gray-matter` and `remark`
3. **Static Generation**: Next.js generates static pages via `generateStaticParams()` in dynamic routes
4. **Type Safety**: Content interfaces defined in `src/types/content.ts`

## CMS Configuration

### Local vs Production Backend
- **Local**: Uses `test-repo` backend with `local_backend: true` in `public/admin/config.yml`
- **Production**: Switch to `git-gateway` backend and remove `local_backend` setting

### Content Relations
The CMS supports content relationships:
- Games can reference Galleries
- Tournaments can reference Results Galleries  
- Pages can reference Galleries

## Deployment Architecture

### Static Export Configuration
- **Next.js Config**: Static export mode with unoptimized images for compatibility
- **Build Output**: All assets generated to `out/` directory
- **Deployment Target**: Netlify with configuration in `netlify.toml`

### CMS Authentication Flow
1. **Local**: Direct file system access via proxy server
2. **Production**: Netlify Identity → Git Gateway → GitHub commits → Netlify rebuild

## File Structure Notes

### Dynamic Routes
- `/games/[slug]/` - Individual game pages
- `/tournaments/[slug]/` - Individual tournament pages
- Gallery pages reference but don't have individual routes yet

### Content Processing
The `src/lib/markdown.ts` utilities handle:
- Slug extraction from filenames (removing locale suffixes)
- Markdown to HTML conversion
- Frontmatter parsing
- Locale-specific content retrieval

### Kill Team Chooser (`/[locale]/kill-team/choose-a-team/`)
- **Page**: subpage `content/subpages/kill-team-choose-a-team.{en,hu}.md` with a `kill_team_chooser` content block. All UI labels come from the block `labels` (CMS).
- **Code**: `src/components/content-blocks/kill-team-chooser/` (client component `KillTeamChooser.tsx`)
  - `filters.ts` - `Answers` type, `FACTION_TREE` (main → sub factions), `matchesAnswers()`, URL sync (`answersFromSearch`, `buildSearch`, `team` param)
  - `legality.ts` - `getLegality()`: legal until 30 Nov of `legal_until`; `rotates_soon` in the last year; `declassified` hidden unless `legal=declassified`
- **Data**: `getKillTeams(locale)` in `src/lib/markdown.ts` reads `content/killteams/`, keeps only `reviewed` teams, and takes `KILL_TEAM_SHARED_FIELDS` from the `en` file. `store_boxes` is a list of slugs of `content/storeboxes/` entries (CMS relation); `getKillTeams` resolves them to `KillTeamStoreBox` objects and fails the build on an unknown slug. Types: `KillTeam`, `KillTeamStoreBox` in `src/types/content.ts`.
- **Store links**: shared `src/components/StoreBoxLinks.tsx` (product name + webstore icons). Store list `STORES` and `NAME_LINK_STORE_ID` (store that the product name links to, now `warhammer`) are in `src/lib/storeBoxes.ts`. In CMS text fields (`content`, `left_content`, `right_content`), `{store-box-slug}` becomes a store box: `processContentBlocks` in `src/lib/markdown.ts` replaces it with a `data-store-box` placeholder and adds `block.storeBoxes`; `src/components/RichText.tsx` renders the placeholders. An unknown slug fails the build.
- **Analytics**: `trackEvent` events `kt_filter_change`, `kt_filter_reset`, `kt_team_select`
- **Tests**: `tests/kill-team-chooser.spec.ts`, content helpers in `tests/helpers/content.ts`
- **Content updates**: `killteam-update` skill

## Responsive Design Guidelines

### Screen Breakpoints
- **Mobile**: 360px - 767px (minimum usable width: 360px, Tailwind breakpoint until "md")
- **Tablet**: 768px - 1279px (Tailwind breakpoint: from "md" until "xl")
- **Desktop**: 1280px and above (Tailwind breakpoint: from "xl")
- Navigation bar has additional breakpoints due to its complexity

### CSS Measurement Standards (2025 Best Practices)
- **rem**: Use for typography, consistent spacing, and major layout dimensions (accessible, scales with user preferences)
- **em**: Use for component-level margins/padding that should scale with parent element font size
- **px**: Use sparingly for borders, shadows, and situations requiring absolute precision
- **%**: Use for responsive container widths and flexible layouts
- **CSS clamp()**: Use for fluid typography and spacing that scales smoothly between breakpoints

### Design Principles
- Mobile-first approach: Design for smallest screen first, then enhance for larger screens
- Touch-friendly targets: Minimum 44px touch targets on mobile
- Content hierarchy: Most important content should be visible without scrolling on mobile
- Performance: Responsive images and optimized assets for different screen sizes

## Developement guidelines
- DO NOT EVER use default values for data coming from the CMS. DO NOT use locale dependant magic strings either.
- After finishing your task, run E2E tests and "npm run build", observe results. On failure, analyse failure reasons. If failure is because development issues, continue iteration of development.
- If you ever want to run "npm run dev", check if the server is already running on port 3000, so you don't have to start another instance
- Do not write "await page.waitForLoadState('networkidle')" in the E2E tests, Playwright handles this automatically
- E2E tests must not assert against constant content values (texts, translations, labels, team names, counts or other data from `content/`). Read the expected values from the content files with the shared helpers in `tests/helpers/content.ts` (for example `pageData`, `chooserLabels`, `killTeam`, `findKillTeam`, `fillTemplate`) and add new helpers there when needed. Select test data by its properties (for example `findKillTeam('legal pro-only', ...)`), not by a fixed slug. Constants of the code (test ids, URL parameters, faction tree values) are allowed.