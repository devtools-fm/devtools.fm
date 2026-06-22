# Episode Doc Structure

## Table of Contents
1. [Document Header](#document-header)
2. [Guest Links](#guest-links)
3. [Framing Section](#framing-section)
4. [Topic Sections](#topic-sections)
5. [Future](#future)
6. [Annotated Example](#annotated-example)

## Document Header

```markdown
**Guest:** [Full Name] — [Title] at [Company]
```

If returning guest, add: `**Previous Episode:** #[number] — [title]`

The discussion title (set separately when posting) uses the format: `First Last - Company`

## Guest Links

Appears immediately after the header, before any content sections.

```markdown
## Guest Links

- **[Label]:** [URL]
- **[Label]:** [URL]
```

## Framing Section

Opens the doc with context for why this conversation matters *right now*. Sets the angle for hosts.

```markdown
## Framing — The Big Picture

- [ ] [Opening question to orient listeners who don't know the guest?]
- [ ] [Alternative angle or follow-up framing question?]
```

## Topic Sections

2–4 sections, each covering a distinct area. Structure each section the same way:

```markdown
## [Topic Name]

> - [Fact or link supporting this section]
> - [Metric, announcement, or quote worth knowing]
> - [Additional context if needed]

- [ ] [Must-ask question?] [Optional: brief parenthetical with context or what to listen for]
- [ ] [Must-ask question?]
- [ ] [Optional question — ask if time allows?]
- [ ] [Optional question — ask if conversation goes there?]
```

The `>` blockquote is a "Context" block — include it when the question relies on specific facts the hosts should have handy (numbers, timeline, quotes). Skip it for straightforward questions.

**Claims in questions must be sourced.** If a question asserts something verifiable ("you worked at X", "you raised $Y", "you were quoted saying Z"), use a footnote:

```markdown
- [ ] You worked at Bridgewater[^bridgewater] before starting this — what did that teach you?

[^bridgewater]: https://techcrunch.com/...
```

Each footnote reference must have a distinct label, even if two references point to the same URL. Never reuse a label. Footnotes go at the end of the document.

Use [text fragments](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments) (`#:~:text=`) to deep-link to the specific claim on the page whenever possible. Fetch the page first to find the exact phrase, then URL-encode it. Example:

```
[^bridgewater]: https://techcrunch.com/.../#:~:text=former%20investment%20logic%20engineer%20at%20Bridgewater%20Associates
```

If you can't access the page or can't confirm the exact text, omit the fragment rather than guessing.

**Good topics to cover (pick what's relevant to the guest):**
- Origin story / how the project started
- The core technical insight or design decision that defines the tool
- Developer experience philosophy — what are you optimizing for?
- Open source model, sustainability, business model
- Community and adoption — who's using this and how?
- The hard problem — what's actually difficult about what they built?
- AI and the future — how does LLM-era tooling change things?
- Competitive landscape — how do you think about alternatives?

## Future

3–5 forward-looking questions to close the episode. Keep them specific to the guest — avoid generic "what's next?" filler.

```markdown
## Future

- [ ] [Guest-specific forward-looking question]?
- [ ] Where do you see [their domain] in 3–5 years?
- [ ] [Provocative or opinionated closing question]?
```

## Annotated Example

```markdown
**Guest:** Jane Smith — Founder & CEO, Acme Corp

## Guest Links

- **Acme Bundler:** [acme-bundler.dev](https://acme-bundler.dev)
- **GitHub:** [github.com/acme-corp/bundler](https://github.com/acme-corp/bundler)
- **Jane on X:** [x.com/janesmith](https://x.com/janesmith)

## Framing — The Big Picture

- [ ] For someone who's never heard of Acme Bundler — what's the elevator pitch, and what made you think the build tools space needed another entrant?
- [ ] You've talked about being frustrated with existing tools while at [Previous Company][^prevco]. What specifically broke?

## The Build-Graph-as-Database Idea

> - Acme caches build artifacts in a SQLite database rather than on the filesystem
> - Incremental builds are ~10x faster than webpack on the same monorepo[^bench]
> - The query API lets you ask "what would change if I modify this file?" before running anything

- [ ] Walk us through the "build graph as a database" model. What does it mean in practice for a developer running `acme build` vs. `webpack build`?
- [ ] Using SQLite as the artifact cache is a surprising choice. Why a database instead of a content-addressable filesystem like Turborepo or Nx use?
- [ ] The query API is something I haven't seen in other tools. What's an example of a question you can now ask about your build that you couldn't before?

## Open Source and Business Model

> - Acme Bundler is MIT-licensed; the company sells hosted caching at [acme-bundler.dev/cloud](https://acme-bundler.dev/cloud)

- [ ] The core bundler is MIT, but you're building a hosted caching service on top. How do you draw the line between what's free and what's paid — and how do you keep that line from creeping over time?
- [ ] Who's the customer you're optimizing for right now? Individual developers, mid-size startups, or enterprise monorepos?
- [ ] There are a few well-funded build-tool companies in this space now. How do you think about differentiation when the competition can also hire great engineers and ship fast?

## Future

- [ ] What's the next milestone that would tell you Acme has "made it"?
- [ ] In 5 years, do developers think about build configuration at all, or does the tooling just figure it out?

[^prevco]: https://example.com/jane-smith-interview
[^bench]: https://acme-bundler.dev/benchmarks
```
