# Sector Hungaricus Website

A static website for the Hungarian skirmish gaming community, built with Next.js and Decap CMS.

## Features

- ✅ **Static Site Generation** - Fast, secure, and SEO-friendly
- ✅ **Multilingual Support** - English and Hungarian content
- ✅ **Git-based CMS** - Content managed through Decap CMS (no separate backend)
- ✅ **Game Management** - Individual pages for Kill Team, Spearhead, and other games
- ✅ **Tournament System** - Upcoming, ongoing, and completed tournament tracking
- ✅ **Gallery System** - Image galleries with admin upload capabilities
- ✅ **Responsive Design** - Mobile-friendly design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **CMS**: Decap CMS (Git-based)
- **Content**: Markdown with frontmatter
- **Deployment**: Netlify (free tier)
- **Languages**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Git

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development servers**
   
   **Option A: Run both servers with one command (recommended)**
   ```bash
   npm run dev:cms
   ```
   
   **Option B: Run servers separately**
   ```bash
   # Terminal 1: Start Next.js dev server
   npm run dev
   
   # Terminal 2: Start CMS proxy server
   npm run cms
   ```

3. **Open your browser**
   - Website: [http://localhost:3000](http://localhost:3000)
   - CMS Admin: [http://localhost:3000/admin/index.html](http://localhost:3000/admin/index.html)

### Testing

**End-to-End Tests**

Run Playwright e2e tests to verify functionality:

```bash
# Run all e2e tests (headless)
npm test

# Run tests with UI for debugging
npm run test:ui
```

The e2e tests cover:
- ✅ **Redirects**: Root URL redirects to Hungarian locale (`/hu/`)
- ✅ **Language**: Hungarian and English content displays correctly
- ✅ **Rendering**: Pages load with HTTP 200 and no React errors
- ✅ **Games**: Kill Team and Spearhead games appear on homepage
- ✅ **Subpages**: Game-specific navigation and content blocks
- ✅ **Calendar**: Tournament listings and CMS content display
- ✅ **Theme**: Dark/light mode toggle and persistence
- ✅ **Gallery**: Image display and lightbox functionality
- ✅ **Responsive**: Mobile, tablet, and desktop layouts

Tests automatically start the dev server and run against `localhost:3000`.

### Content Management

- **Local Development**: No authentication required, direct file editing
- **Production**: Uses Netlify Identity for secure access
- **CMS Features**: Games, tournaments, galleries, pages with multilingual support

## Deployment

### Deploy to Netlify

By pushing/merging to the `origin/main` branch, new content is automatically deployed to Netlify.

## Adding Content

Add new content via [http://localhost:3000/admin/index.html](CMS Admin).

### Games
Games are displayed on the home page and have subpages with game related content.

**Fields:**
- **Title** - Game name (multilingual)
- **Description** - Brief description of the game (multilingual)
- **Featured Image** - Optional hero image for the game page
- **Body** - Main content written in Markdown (multilingual)

### Subpages
Game-specific content pages.

**Fields:**
- **Title** - Page title (multilingual)
- **Hide Title** - Option to hide the page title in display
- **Slug** - URL-friendly identifier
- **Order** - Sort order for navigation (numeric)
- **Game** - Associated game (relationship to games collection)
- **Content Blocks** - Flexible content system with multiple block types:
  - **Text Block** - Standard markdown content with normal/bordered styling
  - **Hero Block** - Prominent featured content sections
  - **Two Column Block** - Side-by-side content layout (one column on mobile)
  - **Gallery Block** - Reference to image galleries
  - **Page Reference Block** - Embed custom React .tsx components

### Pages
Dedicated site pages (ie: About us, Support us, etc.). Creating new ones in CMS won't get them displayed. Their localized fields are displayed on specific React pages/components.

**Fields:**
- **Title** - Page title (multilingual)
- **Slug** - URL identifier
- **Hero** - Optional hero section content (multilingual markdown)
- **Body** - Main page content (multilingual markdown)

### Tournaments
Automatically displays on calendar page if date is in the future

**Fields:**
- **Title** - Tournament name
- **Date** - Tournament date and time
- **Game** - Associated game (relationship to games collection)
- **URL** - Registration or information link

### Galleries
Image collections in `content/galleries/` for use throughout the site:
- Referenced by other content types (currently: subpage gallery block)

**Fields:**
- **Title** - Gallery name
- **Description** - Optional gallery description
- **Images** - List of images with:
  - **Image** - File upload
  - **Caption** - Optional image caption
  - **Alt Text** - Required accessibility text

#### Image Optimization

The site automatically generates optimized image variants for gallery images during build:

- **Thumbnails** (400×300px, 85% quality) - Used for gallery grids
- **Mobile** (800×600px, 90% quality) - Optimized for mobile screens
- **Desktop** (1200px width, 95% quality) - Full quality for desktop viewing

**How it works:**
1. Upload original images through the CMS to `public/uploads/`
2. Add images to gallery content via CMS
3. During build (`npm run build`), the system scans all gallery content
4. Only images referenced in galleries are processed for variants
5. Variants are automatically used based on screen size

**Manual processing:**
```bash
npm run process-images
```

**Generated files are ignored by Git** - they're created during each build, keeping the repository clean while ensuring optimal performance.

## Customization

### Styling
- Edit `src/app/globals.css` for global styles
- Modify Tailwind classes in components

### Components
Key components:
- `src/components/Navigation.tsx` - Main navigation
- `src/lib/markdown.ts` - Content processing utilities

### CMS Configuration
Edit `public/admin/config.yml` to modify:
- Content types
- Field definitions
- Workflow settings

## License

This project is open source and available under the MIT License.
