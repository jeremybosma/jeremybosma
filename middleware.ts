const MARKDOWN_FILES: Record<string, string> = {
  "/": "/index.md",
  "/about": "/about.md",
  "/contact": "/contact.md",
  "/privacy": "/privacy.md",
  "/agency": "/agency.md",
  "/writing": "/writing.md",
  "/supply": "/supply.md",
  "/gallery": "/gallery.md",
  "/videos": "/videos.md",
  "/music": "/music.md",
  "/404": "/404.md",
};

const NOT_FOUND_MARKDOWN = `# Not found

This path does not exist on jeremybosma.nl.

## Where to go next

- [Home](https://jeremybosma.nl/)
- [About](https://jeremybosma.nl/about)
- [Contact](https://jeremybosma.nl/contact)
- [llms.txt](https://jeremybosma.nl/llms.txt)
- [Sitemap](https://jeremybosma.nl/sitemap.xml)
`;

function isSkippablePath(pathname: string) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (pathname.startsWith("/_vercel")) return true;
  return /\.(?:js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|json|xml|txt|md)$/i.test(
    pathname
  );
}

function prefersMarkdown(header: string | null): boolean {
  if (!header) return false;

  let bestMarkdownQ = -1;
  let bestHtmlQ = -1;
  let markdownPos = Infinity;
  let htmlPos = Infinity;

  for (const [index, raw] of header.split(",").entries()) {
    const [typePart, ...params] = raw.trim().split(";");
    const type = (typePart ?? "").trim().toLowerCase();
    let q = 1;
    for (const param of params) {
      const [name, value] = param.split("=").map((part) => part.trim());
      if (name === "q") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }
    if (q <= 0) continue;

    if (type === "text/markdown") {
      bestMarkdownQ = q;
      markdownPos = index;
    }
    if (type === "text/html") {
      bestHtmlQ = q;
      htmlPos = index;
    }
  }

  if (bestMarkdownQ < 0) return false;
  if (bestHtmlQ < 0) return true;
  if (bestMarkdownQ !== bestHtmlQ) return bestMarkdownQ > bestHtmlQ;
  return markdownPos < htmlPos;
}

function continueRequest(headers?: Record<string, string>) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("x-middleware-next", "1");
  return new Response(null, { headers: responseHeaders });
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  if (isSkippablePath(pathname)) {
    return continueRequest({
      Vary: "Accept, Accept-Encoding",
    });
  }

  if (!prefersMarkdown(request.headers.get("accept"))) {
    return continueRequest({
      Vary: "Accept, Accept-Encoding",
    });
  }

  const documentPath = normalizePath(pathname);
  const markdownFile = MARKDOWN_FILES[documentPath];

  if (!markdownFile) {
    return new Response(NOT_FOUND_MARKDOWN, {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept, Accept-Encoding",
      },
    });
  }

  const destination = new URL(markdownFile, request.url);
  return new Response(null, {
    headers: {
      "x-middleware-rewrite": destination.toString(),
      Vary: "Accept, Accept-Encoding",
    },
  });
}

export const config = {
  runtime: "edge",
  matcher: ["/((?!api/|_vercel|assets/).*)"],
};
