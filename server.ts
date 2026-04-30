import 'dotenv/config';
import express from "express";
import app from "./server/app";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const PORT = parseInt(process.env.PORT || '3000', 10);

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Starting server in development mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("Starting server in production mode...");
      const distPath = path.resolve(__dirname, "dist");
      
      // Verify dist path exists
      console.log(`Serving static files from: ${distPath}`);
      
      app.use(express.static(distPath, {
        index: false // We handle index.html manually to inject runtime config
      }));

      app.get("*", (req, res) => {
        const indexPath = path.resolve(distPath, "index.html");

        // Inject Firebase config as window.__ENV__ at runtime.
        // This lets Cloud Run pass env vars at runtime without baking them into the Vite bundle.
        const runtimeEnv = {
          FIREBASE_API_KEY:            process.env.FIREBASE_API_KEY            ?? "",
          FIREBASE_AUTH_DOMAIN:        process.env.FIREBASE_AUTH_DOMAIN        ?? "",
          FIREBASE_PROJECT_ID:         process.env.FIREBASE_PROJECT_ID         ?? "",
          FIREBASE_STORAGE_BUCKET:     process.env.FIREBASE_STORAGE_BUCKET     ?? "",
          FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "",
          FIREBASE_APP_ID:             process.env.FIREBASE_APP_ID             ?? "",
        };

        const envScript = `<script>window.__ENV__ = ${JSON.stringify(runtimeEnv)};</script>`;

        import("fs").then(({ readFileSync }) => {
          const html = readFileSync(indexPath, "utf-8").replace(
            "<head>",
            `<head>\n    ${envScript}`
          );
          res.setHeader("Content-Type", "text/html");
          res.send(html);
        });
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Monolith server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
