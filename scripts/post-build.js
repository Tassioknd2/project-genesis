import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, ".output");
const distDir = path.join(rootDir, "dist");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log("[post-build] Syncing build artifacts to dist/ for deployment...");

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Copy public assets from .output/public to dist/
  const outputPublic = path.join(outputDir, "public");
  if (fs.existsSync(outputPublic)) {
    copyRecursiveSync(outputPublic, distDir);
    console.log("[post-build] Copied .output/public -> dist/");
  }

  // 2. Copy public directory if present
  const publicFolder = path.join(rootDir, "public");
  if (fs.existsSync(publicFolder)) {
    copyRecursiveSync(publicFolder, distDir);
    console.log("[post-build] Copied public/ -> dist/");
  }

  // 3. Copy server artifacts
  const outputServer = path.join(outputDir, "server");
  const distServer = path.join(distDir, "server");
  if (fs.existsSync(outputServer)) {
    copyRecursiveSync(outputServer, distServer);
    console.log("[post-build] Copied .output/server -> dist/server/");
  }

  // 4. Generate dist/index.html fallback if not present
  const assetsDir = path.join(distDir, "assets");
  let cssTags = "";
  let jsTags = "";

  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const cssFiles = assetFiles.filter((f) => f.endsWith(".css"));
    const jsFiles = assetFiles.filter((f) => f.endsWith(".js") && f.startsWith("index-"));
    const otherJs = assetFiles.filter((f) => f.endsWith(".js") && !f.startsWith("index-"));

    cssTags = cssFiles.map((f) => `<link rel="stylesheet" href="/assets/${f}" />`).join("\n    ");
    jsTags = jsFiles
      .map((f) => `<script type="module" src="/assets/${f}"></script>`)
      .join("\n    ");

    if (!jsTags && otherJs.length > 0) {
      jsTags = otherJs
        .map((f) => `<script type="module" src="/assets/${f}"></script>`)
        .join("\n    ");
    }
  }

  const indexHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agenda Cardio</title>
    <meta name="description" content="Agenda inteligente para clínica de cardiologia com confirmações automáticas por WhatsApp." />
    <meta property="og:title" content="Agenda Cardio" />
    <meta property="og:description" content="Agenda inteligente para clínica de cardiologia com confirmações automáticas por WhatsApp." />
    <meta property="og:type" content="website" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
    ${cssTags}
  </head>
  <body>
    <div id="root"></div>
    ${jsTags}
  </body>
</html>
`;

  const indexHtmlPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexHtmlPath)) {
    fs.writeFileSync(indexHtmlPath, indexHtmlContent, "utf8");
    console.log("[post-build] Generated dist/index.html fallback.");
  }

  // Also create 200.html and 404.html for static SPA routing fallbacks
  fs.writeFileSync(path.join(distDir, "200.html"), indexHtmlContent, "utf8");
  fs.writeFileSync(path.join(distDir, "404.html"), indexHtmlContent, "utf8");

  const filesInDist = fs.readdirSync(distDir);
  console.log(
    `[post-build] Success! dist/ populated with ${filesInDist.length} root items:`,
    filesInDist.join(", "),
  );
} catch (err) {
  console.error("[post-build] Error syncing build artifacts:", err);
  process.exit(1);
}
