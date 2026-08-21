function isSkippablePath(pathname: string) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (pathname.startsWith("/_vercel")) return true;
  return /\.(?:js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|json|xml|txt)$/i.test(
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

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  if (isSkippablePath(pathname)) {
    return continueRequest();
  }

  const isMarkdownUrl = pathname.endsWith(".md");
  if (!isMarkdownUrl && !prefersMarkdown(request.headers.get("accept"))) {
    return continueRequest({
      Vary: "Accept, Accept-Encoding",
    });
  }

  const documentPath = isMarkdownUrl ? pathname.slice(0, -3) || "/" : pathname;
  const destination = new URL("/api/markdown", request.url);
  destination.searchParams.set("path", documentPath);

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
