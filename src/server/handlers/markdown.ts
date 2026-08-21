import {
  getAgentMarkdown,
  MARKDOWN_HEADERS,
  normalizeAgentPath,
  NOT_FOUND_MARKDOWN_BODY,
} from "../../lib/agent-content";

export function markdownForPath(pathname: string): { body: string; status: number } {
  const path = normalizeAgentPath(pathname);
  const staticMarkdown = getAgentMarkdown(path);
  if (staticMarkdown) {
    return { body: staticMarkdown, status: 200 };
  }

  return { body: NOT_FOUND_MARKDOWN_BODY, status: 404 };
}

export function handleMarkdownRequest(pathname: string): Response {
  const { body, status } = markdownForPath(pathname);
  return new Response(body, {
    status,
    headers: MARKDOWN_HEADERS,
  });
}
