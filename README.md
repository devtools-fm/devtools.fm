# DevTools.fm <a src="https://vercel.com?utm_source=devtools-fm&utm_campaign=oss"><img align="right" src="./public/vercel.svg"></a>

A podcast about developer tools and the people who make them.

## Getting Started

### Prerequisites

- [mise](https://mise.jdx.dev/) - for managing Node.js and pnpm versions

### Installation

```bash
# Install mise (if not already installed)
curl https://mise.run | sh

# Install project dependencies and tools
mise install          # Installs Node.js 22.17.0 and pnpm 10.14.0
mise run install      # Installs npm dependencies

# Start development server
mise run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Development Commands

All commands can be run through mise for consistent environment management:

```bash
mise run dev                # Start Next.js dev server
mise run build              # Build for production (includes RSS generation)
mise run build-rss          # Generate RSS feed only
mise run create-new-episode # Create a new episode template
mise run publish-episode    # Publish an episode (see PRODUCTION_PROCESS.md)
```

Alternatively, you can use pnpm directly after running `mise install`:

```bash
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build for production
pnpm build-rss              # Generate RSS feed only
pnpm create-new-episode     # Create a new episode template
pnpm publish-episode        # Publish an episode
```

## Project Structure

```
devtools.fm/
├── app/                    # Next.js App Router pages and API routes
│   ├── episode/[id]/       # Individual episode pages
│   ├── episodes/           # Episode listing
│   ├── guests/             # Guest information
│   ├── sponsors/           # Sponsor pages
│   └── api/                # API endpoints for forms
├── pages/episode/          # Episode content (MDX files)
│   ├── 1.mdx              # Episode 1
│   ├── 2.mdx              # Episode 2
│   └── ...                # Episodes 3-148+
├── components/             # React components
├── utils/                  # Utility functions
│   ├── processMdx.ts      # MDX parsing and processing
│   └── generate-rss.ts    # RSS feed generation
├── scripts/                # Build and content scripts
└── public/                 # Static assets
```

## Episode Format

Episodes are written in MDX format with structured content:

```mdx
---
title: "Episode Title"
youtube: https://youtube.com/watch?v=VIDEO_ID
spotify: https://open.spotify.com/episode/EPISODE_ID
tags: tag1, tag2, tag3
---

{/* TAB: SHOW NOTES */}
Episode description and links...

{/* TAB: SECTIONS */}
00:00 - Introduction
05:30 - Main topic
...

{/* TAB: TRANSCRIPT */}
**Speaker Name:** Transcript content...
```

## Contributing

For information on the production process and how to create new episodes, see [PRODUCTION_PROCESS.md](./PRODUCTION_PROCESS.md).

## License

This project is open source and available under the MIT License.

## Acknowledgments

Thanks to Vercel for hosting and to all our supporters and sponsors who make this podcast possible.
