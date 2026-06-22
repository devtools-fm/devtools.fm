---
name: devtools-episode-doc
description: Create episode prep documents for devtools.fm podcast. Use when asked to create a new episode doc, prep a guest doc, or write an interview guide for an upcoming episode. The document is posted as a GitHub Discussion in the devtools-fm/devtools.fm repo.
---

# devtools.fm Episode Doc

devtools.fm is a podcast about developer tools and the people who make them. The audience is software engineers — comfortable with technical depth, interested in open source, and curious about business models behind dev tools.

## Workflow

1. Ask the user: **Who is the guest and what do they work on?** If they haven't provided it.
2. Research the guest and their work using web search before writing.
3. Draft the episode doc following the structure in `references/structure.md`.
4. Open it in Roughdraft for review, wait for the user to finish.
   - **After Roughdraft closes, re-read the file from disk.** Roughdraft may reformat it — in particular it breaks `- [ ] **Question?**` into multi-line list items. Fix these before posting: each question must be a single line with the checkbox and question text together.
   - All checkboxes in the posted doc must be unchecked (`[ ]`), regardless of `[x]` / `[ ]` distinctions used during drafting.
5. Post it as a GitHub Discussion using GraphQL (the REST endpoint doesn't work):

```bash
# Repo ID: R_kgDOFXAlwg  |  Announcements category ID: DIC_kwDOFXAlws4CN_gm
BODY=$(cat /path/to/file.md)
gh api graphql -f query='mutation CreateDiscussion($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
  createDiscussion(input: {repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body}) {
    discussion { url }
  }
}' -f repoId="R_kgDOFXAlwg" -f categoryId="DIC_kwDOFXAlws4CN_gm" -f title="[GUEST NAME] - [COMPANY/PROJECT]" -f body="$BODY"
```

Title format: `"First Last - Company"` (no episode number — matches existing discussions)

## Tone & Approach

- Questions should feel like actual conversation starters, not interview questionnaire items
- Research-backed: include real context (metrics, dates, quotes, links) so hosts can sound informed without memorizing facts
- Opinionated framing: push past surface-level answers — the audience wants the real story
- Balance retrospective ("how did this start?") with forward-looking ("where is this going?")
- Don't shy away from technical depth, but don't let any one technical rabbit hole consume the episode

## Question Checklist Format

Used during drafting to prioritize questions — all are posted as `[ ]` (unchecked):

- `[x]` = must-ask question (prioritize these)
- `[ ]` = optional or contingent question (ask if time allows or conversation naturally goes there)

## See Also

- `references/structure.md` — full document structure with annotated example
