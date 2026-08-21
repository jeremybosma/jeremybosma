import { next } from "@vercel/functions";
import { preferredType } from "./src/lib/accept";
import { markdownAlternatePath, SITE_URL } from "./src/lib/site";
import { handleMarkdownRequest } from "./src/server/handlers/markdown";

function isSkippablePath(pathname: string) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (pathname.startsWith("/_vercel")) return true;
  return /\.(?:js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|json|xml|txt)$/i.test(
    pathname
  );
}

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (isSkippablePath(pathname)) {
    return next();
  }

  const isMarkdownUrl = pathname.endsWith(".md");
  const accept = request.headers.get("accept");
  const chosen = preferredType(accept);

  if (isMarkdownUrl || chosen === "text/markdown") {
    const documentPath = isMarkdownUrl
      ? pathname.slice(0, -3) || "/"
      : pathname;
    return handleMarkdownRequest(documentPath);
  }

  if (chosen === null && accept) {
    return new Response(
      "Not Acceptable\n\nAvailable: text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
        },
      }
    );
  }

  const documentPath =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  return next({
    headers: {
      Vary: "Accept, Accept-Encoding",
      Link: `<${SITE_URL}/llms.txt>; rel="describedby", <${markdownAlternatePath(documentPath)}>; rel="alternate"; type="text/markdown"`,
    },
  });
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api/|_vercel|assets/).*)"],
};
