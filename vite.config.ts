import { config as loadDotenv } from "dotenv";
import { defineConfig, type Plugin } from "vite";

loadDotenv();
import tailwindcss from "@tailwindcss/vite";
import { sitex } from "@fulldotdev/sitex/plugin";
import react from "@vitejs/plugin-react";
import { handleAlbumArt } from "./src/server/handlers/album-art";
import { handleStreamingUrl } from "./src/server/handlers/streaming-url";

function apiDevMiddleware(): Plugin {
  return {
    name: "portfolio-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }

        try {
          const requestUrl = new URL(req.url ?? "/", "http://localhost");
          let response: Response;

          if (url === "/api/music/album-art") {
            response = await handleAlbumArt(requestUrl);
          } else if (url === "/api/music/streaming-url") {
            response = await handleStreamingUrl(requestUrl);
          } else {
            next();
            return;
          }

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          res.end(await response.text());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  appType: "custom",
  plugins: [tailwindcss(), react(), sitex(), apiDevMiddleware()],
  publicDir: "public",
});
