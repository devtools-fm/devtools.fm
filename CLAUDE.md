# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

devtools.fm is a Next.js 15-based podcast website built with TypeScript and Tailwind CSS 4. The site features episodes stored as MDX files with structured content including show notes, sections, and transcripts.

## Development Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (port 3000)
mise run dev               # Alternative via mise

# Building  
pnpm build                 # Full build with RSS generation
pnpm build-rss            # Generate RSS feed only

# Content Management
pnpm create-new-episode   # Create new episode template in /pages/episode/
pnpm publish-episode      # Publish episode (see PRODUCTION_PROCESS.md)
```

## Architecture

### Episode Content Structure

Episodes are MDX files in `/pages/episode/` with this structure:
```yaml
---
title: Episode Title
youtube: https://youtube.com/watch?v=ID
spotify: https://spotify.com/episode/ID  
tags: comma, separated, tags
---
```

Content is organized using TAB markers:
- `{/* TAB: SHOW NOTES */}` - Episode description and links
- `{/* TAB: SECTIONS */}` - Timestamp-based sections  
- `{/* TAB: TRANSCRIPT */}` - Full transcript with speaker attribution

### Key Processing Logic

- **utils/processMdx.ts**: Parses MDX files to extract metadata, tabs, guests from transcript, and creation dates from git history
- **app/episode/[id]/page.tsx**: Renders individual episode pages
- **app/episodes/page.tsx**: Lists all episodes with pagination

### Styling Approach

Uses Tailwind CSS 4 with new CSS syntax:
```css
@source "..." /* Component scanning */
@theme { /* Color definitions */ }
```

Dark mode is handled via `prefers-color-scheme`. DevTools DS themes (Firefox theme) are integrated for theming.

### Environment Configuration

The project uses mise.toml for environment management with Node.js 22.17.0 and pnpm 10.14.0. The configuration includes path setup for node_modules/.bin and automatic .env loading.

## Important Context

- **No linting/formatting setup** - Consider adding Biome or similar before making large changes
- **TypeScript strict mode disabled** - Be cautious with type assumptions
- **Git-based dates** - Episode creation dates come from git history, not frontmatter
- **Guest detection** - Automatically extracted from transcript content
- **RSS generation** - Runs as part of build process, generates feed.xml

## Production Workflow

Detailed episode production process is documented in PRODUCTION_PROCESS.md, including:
- 3-pass editing workflow
- Multi-platform publishing (YouTube, Buzzsprout, website)
- Asset management and content creation guidelines