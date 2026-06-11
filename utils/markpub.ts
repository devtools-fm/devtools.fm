export type MarkpubFlavor = "gfm" | "commonmark";

export type MarkpubMarkdownRecord = {
  $type: "at.markpub.markdown";
  flavor: MarkpubFlavor;
  renderingRules: string;
  extensions?: string[];
  frontMatter?: Record<string, unknown>[];
  text: {
    $type: "at.markpub.text";
    markdown: string;
  };
};

export const DEFAULT_MARKPUB_FLAVOR: MarkpubFlavor = "gfm";
export const DEFAULT_MARKPUB_RENDERING_RULES = "remark-gfm";
export const DEFAULT_MARKPUB_EXTENSIONS = ["YAML"];

export function stripMarkdownForTextContent(markdown: string) {
  return markdown
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(~{1,2})([^~]+?)\1/g, "$2")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^\s*\[\^[^\]]+\]:[^\r\n]*(?:\r?\n[ \t]+[^\r\n]*)*/gm, "")
    .replace(/\[\^\S+\]/g, "")
    .trim();
}

export function buildMarkpubFrontMatter(frontmatter: {
  title?: string;
  description?: string;
  publishDate?: string;
  tags?: string[];
}) {
  const record: Record<string, unknown> = {};

  if (frontmatter.title) {
    record.title = frontmatter.title;
  }

  if (frontmatter.description) {
    record.description = frontmatter.description;
  }

  if (frontmatter.publishDate) {
    record.publishDate = frontmatter.publishDate;
  }

  if (frontmatter.tags?.length) {
    record.tags = frontmatter.tags;
  }

  return Object.keys(record).length > 0 ? [record] : undefined;
}

export function buildMarkpubMarkdown(options: {
  markdown: string;
  frontMatter?: Record<string, unknown>[];
  flavor?: MarkpubFlavor;
  renderingRules?: string;
  extensions?: string[];
}): MarkpubMarkdownRecord {
  const {
    markdown,
    frontMatter,
    flavor = DEFAULT_MARKPUB_FLAVOR,
    renderingRules = DEFAULT_MARKPUB_RENDERING_RULES,
    extensions = DEFAULT_MARKPUB_EXTENSIONS,
  } = options;

  return {
    $type: "at.markpub.markdown",
    flavor,
    renderingRules,
    ...(extensions.length > 0 ? { extensions } : {}),
    ...(frontMatter?.length ? { frontMatter } : {}),
    text: {
      $type: "at.markpub.text",
      markdown,
    },
  };
}
