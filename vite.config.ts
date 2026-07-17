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
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
});
