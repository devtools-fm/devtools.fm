# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

devtools.fm is an Astro 7 podcast website built with TypeScript, server-rendered React components, and Tailwind CSS 4. The site features episodes stored as MDX files with structured content including show notes, sections, and transcripts.

## Getting Started

See [README.md](./README.md) for installation instructions, prerequisites, and available development commands.

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
- **src/pages/episode/[episodeNumber].astro**: Prerenders individual episode pages
- **src/pages/episodes.astro**: Prerenders the episode listing

### Styling Approach

Uses Tailwind CSS 4 with new CSS syntax:
```css
@source "..." /* Component scanning */
@theme { /* Color definitions */ }
```

Dark mode is handled via `prefers-color-scheme`. DevTools DS themes (Firefox theme) are integrated for theming: components always render their light classes, and `styles/globals.css` overrides the devtools-ds CSS variables for dark mode, so no JS is needed to pick a color scheme.

### Rendering and client JS

React is used to render pages at build time, not shipped to the browser. Pages render their React components without a `client:*` directive, so most pages ship no JS beyond Vercel Analytics.

- **Site nav** (`components/BrowserNav.tsx`): real `<a href>` links styled with devtools-ds `Navigation` class names (no `@reach/tabs`).
- **Episode tabs**: static markup in `components/pages/EpisodePage.tsx` plus a small inline script in `src/pages/episode/[episodeNumber].astro` (`?view=` syncing, history, keyboard).
- **Host inspectors** (`components/Hosts.tsx`): the only React island (`client:visible` on the home page), because devtools-ds' ObjectInspector builds its tree in an effect and is expandable.

Before adding a `client:*` directive, check whether a link, form, or small `<script>` would do.

## Important Context

- **No linting/formatting setup** - Consider adding Biome or similar before making large changes
- **TypeScript strict mode enabled** - Keep island props (`client:*`) serializable
- **Episode dates** - Come from `publishDate`/`date` frontmatter; git history is only a local fallback (Vercel builds from a shallow clone)
- **Guest detection** - Automatically extracted from transcript content
- **RSS generation** - Runs as part of build process (before `astro build`), generates public/rss.xml

## Production Workflow

Detailed episode production process is documented in PRODUCTION_PROCESS.md, including:
- 3-pass editing workflow
- Multi-platform publishing (YouTube, Spotify for Creators, Patreon, website), automated by the `publish-episode` skill and `scripts/publish/`
- Asset management and content creation guidelines