# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

devtools.fm is an Astro 7 podcast website built with TypeScript, React islands, and Tailwind CSS 4. The site features episodes stored as MDX files with structured content including show notes, sections, and transcripts.

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

Dark mode is handled via `prefers-color-scheme`. DevTools DS themes (Firefox theme) are integrated for theming.

## Important Context

- **No linting/formatting setup** - Consider adding Biome or similar before making large changes
- **TypeScript strict mode enabled** - Keep Astro and React props serializable across island boundaries
- **Git-based dates** - Episode creation dates come from git history, not frontmatter
- **Guest detection** - Automatically extracted from transcript content
- **RSS generation** - Runs as part of build process, generates feed.xml

## Production Workflow

Detailed episode production process is documented in PRODUCTION_PROCESS.md, including:
- 3-pass editing workflow
- Multi-platform publishing (YouTube, Buzzsprout, website)
- Asset management and content creation guidelines