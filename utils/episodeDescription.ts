const JSX_COMMENT_REGEX = /^\{\/\*[\s\S]*\*\/\}$/;

const SKIP_SECTION_TITLES =
  /^(introduction|intro|ad|ads?|sponsor(ed)?|outro|wrap up|closing|thanks|thank you)$/i;

const SPONSOR_LINE_REGEX =
  /^(episode sponsored|sponsored by|become a paid subscriber)/i;

const MAX_DESCRIPTION_LENGTH = 500;

function shouldStopShowNotesIntro(line: string) {
  return (
    JSX_COMMENT_REGEX.test(line) ||
    /^- /.test(line) ||
    /^## /.test(line) ||
    /^https?:\/\//.test(line) ||
    SPONSOR_LINE_REGEX.test(line)
  );
}

export function extractShowNotesIntro(showNotes: string) {
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of showNotes.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(" "));
        currentParagraph = [];
      }
      continue;
    }

    if (shouldStopShowNotesIntro(trimmed)) {
      break;
    }

    currentParagraph.push(trimmed);
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(" "));
  }

  return paragraphs.join(" ");
}

function formatSectionTopics(sections: { title: string }[]) {
  const topics = sections
    .map((section) => section.title.trim())
    .filter((title) => title && !SKIP_SECTION_TITLES.test(title));

  if (topics.length === 0) {
    return "";
  }

  if (topics.length <= 4) {
    return ` Topics include ${topics.join(", ")}.`;
  }

  return ` Topics include ${topics.slice(0, 4).join(", ")}, and more.`;
}

export function normalizeEpisodeDescription(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(value: string, maxLength = MAX_DESCRIPTION_LENGTH) {
  if (value.length <= maxLength) {
    return value;
  }

  const truncated = value.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? ")
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.slice(0, lastSentenceEnd + 1).trim();
  }

  return `${truncated.trim()}…`;
}

export function buildEpisodeDescription(options: {
  showNotes?: string;
  sections?: { title: string }[];
}) {
  const intro = normalizeEpisodeDescription(
    extractShowNotesIntro(options.showNotes || "")
  );

  if (!intro) {
    return "";
  }

  let description = intro;

  if (intro.length < 140 && options.sections?.length) {
    description += formatSectionTopics(options.sections);
  }

  return truncateDescription(normalizeEpisodeDescription(description));
}
