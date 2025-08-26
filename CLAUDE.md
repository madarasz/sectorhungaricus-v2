# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev:cms` - Start both Next.js dev server and CMS proxy (recommended for development)
- `npm run dev` - Start Next.js dev server only (localhost:3000)
- `npm run cms` - Start Decap CMS proxy server only (port 8081)
- `npm run build` - Build static site for production (outputs to `out/`)
- `npm run lint` - Run ESLint

### CMS Access
- Local development: http://localhost:3000/admin/index.html (no authentication)
- Production: Uses Netlify Identity for authentication

## Architecture Overview

### Static Site with Git-based CMS
This is a **static Next.js site** using **static export** (`output: 'export'`) with a **Git-based CMS** (Decap CMS). Content is stored as Markdown files in the `content/` directory, not in a database.

### Content Architecture
The site has four content collections managed through the CMS:

1. **Games** (`content/games/`) - Gaming information with multilingual support
2. **Tournaments** (`content/tournaments/`) - Event management with status tracking  
3. **Galleries** (`content/galleries/`) - Photo galleries with metadata
4. **Pages** (`content/pages/`) - General site pages

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
- never use default values for data coming from the CMS