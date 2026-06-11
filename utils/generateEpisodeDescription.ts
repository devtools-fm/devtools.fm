import { execFile } from "child_process";
import { promisify } from "util";

import { extractShowNotesIntro, normalizeEpisodeDescription } from "utils/episodeDescription";
import { parsePodcastSections } from "utils/processMdx";

const execFileAsync = promisify(execFile);

const SKIP_SECTION_TITLES =
  /^(introduction|intro|ad|ads?|sponsor(ed)?|outro|wrap up|closing|thanks|thank you)$/i;

export type EpisodeDescriptionContext = {
  number: string;
  title: string;
  guests: string[];
  tags: string[];
  showNotesIntro: string;
  sections: string[];
};

export function buildEpisodeDescriptionContext(options: {
  number: string;
  title: string;
  guests?: string[];
  tags?: string | string[];
  showNotes?: string;
  sectionsRaw?: string;
}): EpisodeDescriptionContext {
  const tags = Array.isArray(options.tags)
    ? options.tags
    : typeof options.tags === "string"
      ? options.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  const sections = parsePodcastSections(options.sectionsRaw || "")
    .map((section) => section.title.trim())
    .filter((title) => title && !SKIP_SECTION_TITLES.test(title));

  return {
    number: options.number,
    title: options.title,
    guests: options.guests || [],
    tags,
    showNotesIntro: extractShowNotesIntro(options.showNotes || ""),
    sections,
  };
}

function formatContextBlock(context: EpisodeDescriptionContext) {
  const guests =
    context.guests.length > 0 ? context.guests.join(", ") : "see title";
  const sections =
    context.sections.length > 0
      ? context.sections.slice(0, 6).join(", ")
      : "not listed";
  const tags = context.tags.length > 0 ? context.tags.slice(0, 6).join(", ") : "";

  return `Episode #${context.number}
Title: ${context.title}
Guests: ${guests}
Tags: ${tags}
Section topics: ${sections}
Show notes: ${context.showNotesIntro || "none"}`;
}

const DESCRIPTION_RULES = `Rules for each description:
- Exactly one sentence, 120-200 characters if possible, never over 240
- Compelling blurb for podcast apps and social previews
- Name the guest(s) and the main topic or hook
- Do not start with "This week", "In this episode", or "Join us"
- No quotation marks around individual descriptions
- Plain text only`;

export function buildEpisodeDescriptionPrompt(context: EpisodeDescriptionContext) {
  return `Write one podcast episode description sentence for devtools.fm.

${DESCRIPTION_RULES}

${formatContextBlock(context)}

Return only the description sentence.`;
}

export function buildBatchEpisodeDescriptionPrompt(
  contexts: EpisodeDescriptionContext[]
) {
  return `Write one podcast episode description sentence for each devtools.fm episode below.

${DESCRIPTION_RULES}

${contexts.map(formatContextBlock).join("\n\n")}

Return ONLY a valid JSON object mapping episode number strings to description strings. No markdown fences, no commentary.`;
}

function cleanAgentDescription(text: string) {
  const trimmed = text.trim();

  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, string>;
    }
  } catch {
    // Fall through to single-description cleanup.
  }

  return normalizeEpisodeDescription(
    trimmed
      .replace(/^```(?:json|text)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .replace(/^["']|["']$/g, "")
  );
}

async function runAgentPrompt(prompt: string) {
  const agentPath = process.env.CURSOR_AGENT_PATH || "agent";
  const args = ["--print", "--output-format", "text", prompt];

  try {
    const { stdout } = await execFileAsync(agentPath, args, {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 4 * 1024 * 1024,
      timeout: Number(process.env.DESCRIPTION_AGENT_TIMEOUT_MS || 180_000),
    });

    return stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/Authentication required|agent login|CURSOR_API_KEY/i.test(message)) {
      throw new Error(
        "Cursor Agent authentication required. Run `agent login` or set CURSOR_API_KEY in your environment."
      );
    }

    throw error;
  }
}

export async function generateEpisodeDescriptionWithAgent(
  context: EpisodeDescriptionContext
) {
  const stdout = await runAgentPrompt(buildEpisodeDescriptionPrompt(context));
  const cleaned = cleanAgentDescription(stdout);

  if (typeof cleaned === "string" && cleaned) {
    return cleaned;
  }

  throw new Error(`Agent returned an empty description for episode #${context.number}`);
}

export async function generateEpisodeDescriptionsWithAgentBatch(
  contexts: EpisodeDescriptionContext[]
) {
  const stdout = await runAgentPrompt(
    buildBatchEpisodeDescriptionPrompt(contexts)
  );
  const cleaned = cleanAgentDescription(stdout);

  if (typeof cleaned === "object" && cleaned !== null) {
    const results: Record<string, string> = {};

    for (const context of contexts) {
      const description = cleaned[context.number];

      if (typeof description === "string" && description.trim()) {
        results[context.number] = normalizeEpisodeDescription(description);
      }
    }

    if (Object.keys(results).length > 0) {
      return results;
    }
  }

  if (typeof cleaned === "string" && contexts.length === 1) {
    return { [contexts[0].number]: cleaned };
  }

  throw new Error(
    `Agent returned invalid batch descriptions for episodes ${contexts.map((context) => context.number).join(", ")}`
  );
}

function getAnthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
}

export function resolveDescriptionProvider() {
  if (process.env.DESCRIPTION_PROVIDER) {
    return process.env.DESCRIPTION_PROVIDER;
  }

  if (getAnthropicApiKey()) {
    return "anthropic";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "agent";
}

async function callAnthropic(prompt: string, maxTokens = 120) {
  const apiKey = getAnthropicApiKey();

  if (!apiKey) {
    throw new Error(
      "Set ANTHROPIC_API_KEY or ANTHROPIC_KEY to generate descriptions with Anthropic."
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Anthropic API error (${response.status}): ${await response.text()}`
    );
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  return data.content?.find((block) => block.type === "text")?.text || "";
}

export async function generateEpisodeDescriptionWithLlm(
  context: EpisodeDescriptionContext
) {
  const prompt = buildEpisodeDescriptionPrompt(context);

  if (getAnthropicApiKey()) {
    const text = await callAnthropic(prompt);
    return normalizeEpisodeDescription(text.replace(/^["']|["']$/g, ""));
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Set ANTHROPIC_API_KEY, ANTHROPIC_KEY, or OPENAI_API_KEY to generate descriptions with an LLM."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI API error (${response.status}): ${await response.text()}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content || "";
  return normalizeEpisodeDescription(text.replace(/^["']|["']$/g, ""));
}

export async function generateEpisodeDescriptionsWithLlmBatch(
  contexts: EpisodeDescriptionContext[]
) {
  if (getAnthropicApiKey()) {
    const text = await callAnthropic(
      buildBatchEpisodeDescriptionPrompt(contexts),
      Math.max(512, contexts.length * 80)
    );
    const cleaned = cleanAgentDescription(text);

    if (typeof cleaned === "object" && cleaned !== null) {
      const results: Record<string, string> = {};

      for (const context of contexts) {
        const description = cleaned[context.number];

        if (typeof description === "string" && description.trim()) {
          results[context.number] = normalizeEpisodeDescription(description);
        }
      }

      if (Object.keys(results).length > 0) {
        return results;
      }
    }

    throw new Error(
      `Anthropic returned invalid batch descriptions for episodes ${contexts.map((context) => context.number).join(", ")}`
    );
  }

  const results: Record<string, string> = {};

  for (const context of contexts) {
    results[context.number] = await generateEpisodeDescriptionWithLlm(context);
  }

  return results;
}

export async function generateEpisodeDescription(
  context: EpisodeDescriptionContext
) {
  const provider = resolveDescriptionProvider();

  if (provider === "anthropic" || provider === "openai") {
    return generateEpisodeDescriptionWithLlm(context);
  }

  return generateEpisodeDescriptionWithAgent(context);
}
