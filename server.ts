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
        index: false // We handle index.html manually below
      }));
      
      app.get("*", (req, res) => {
        const indexPath = path.resolve(distPath, "index.html");
        res.sendFile(indexPath);
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
