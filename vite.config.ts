import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin, type ViteDevServer } from "vite-plus";

loadDotenv();
import tailwindcss from "@tailwindcss/vite";
import { sitex } from "@fulldotdev/sitex/plugin";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

async function sendApiResponse(
  res: import("node:http").ServerResponse,
  response: Response
) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(await response.text());
}

function sendApiError(
  res: import("node:http").ServerResponse,
  status: number,
  message: string
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: message }));
}

function registerMarkdownMiddleware(server: ViteDevServer) {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (
      url.startsWith("/api/") ||
      url.startsWith("/@") ||
      url.startsWith("/src/") ||
      url.startsWith("/node_modules")
    ) {
      next();
      return;
    }
    if (
      /\.(?:js|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|json|xml|txt)$/i.test(
        url
      )
    ) {
      next();
      return;
    }

    try {
      const { preferredType } = await server.ssrLoadModule("/src/lib/accept.ts");
      const accept = req.headers.accept ?? "";
      const isMarkdownUrl = url.endsWith(".md");
      const chosen = preferredType(accept) as string | null;

      if (!isMarkdownUrl && chosen !== "text/markdown") {
        if (chosen === null && accept) {
          res.statusCode = 406;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Vary", "Accept");
          res.end("Not Acceptable\n\nAvailable: text/html, text/markdown\n");
          return;
        }
        next();
        return;
      }

      const { handleMarkdownRequest } = await server.ssrLoadModule(
        "/src/server/handlers/markdown.ts"
      );
      const pathname = isMarkdownUrl ? url.slice(0, -3) || "/" : url;
      const response = handleMarkdownRequest(pathname) as Response;
      await sendApiResponse(res, response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Markdown request failed";
      sendApiError(res, 500, message);
    }
  });
}

function registerApiMiddleware(server: ViteDevServer) {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (!url.startsWith("/api/")) {
      next();
      return;
    }

    try {
      const { handleApiRequest } = await server.ssrLoadModule(
        "/src/server/handlers/api.ts"
      );
      const requestUrl = new URL(req.url ?? "/", "http://localhost");
      const response = await handleApiRequest(
        req,
        requestUrl,
        (moduleId: string) => server.ssrLoadModule(moduleId)
      );

      if (!response) {
        sendApiError(res, 404, "API route not found");
        return;
      }

      await sendApiResponse(res, response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "API request failed";
      sendApiError(res, 500, message);
    }
  });
}

function apiDevMiddleware(): Plugin {
  return {
    name: "portfolio-api-dev",
    enforce: "pre",
    configureServer(devServer) {
      registerApiMiddleware(devServer);
      registerMarkdownMiddleware(devServer);
    },
  };
}

export default defineConfig({
  appType: "custom",
  plugins: [
    tailwindcss(),
    react(),
    apiDevMiddleware(),
    ...sitex({
      site: { url: "https://jeremybosma.nl" },
      favicon: false,
    }),
  ],
  publicDir: "public",
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-dev-runtime"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
