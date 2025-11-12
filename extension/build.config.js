/**
 * Build configuration for Chrome Extension using esbuild
 * Run: node build.config.js
 */

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const extensionDir = __dirname;
const srcDir = path.join(extensionDir, "src");
const distDir = path.join(extensionDir, "dist");

// Limpiar dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Configuración base de esbuild
const baseConfig = {
  bundle: true,
  minify: false, // Cambiar a true en producción
  sourcemap: true,
  target: "es2020",
  format: "iife",
  platform: "browser",
};

// Build content script
esbuild
  .build({
    ...baseConfig,
    entryPoints: [path.join(srcDir, "content", "index.ts")],
    outfile: path.join(distDir, "content", "index.js"),
    banner: {
      js: "// Content Script for Social Assistant Extension",
    },
  })
  .catch(() => process.exit(1));

// Build background service worker
esbuild
  .build({
    ...baseConfig,
    entryPoints: [path.join(srcDir, "background", "index.ts")],
    outfile: path.join(distDir, "background", "index.js"),
    banner: {
      js: "// Background Service Worker for Social Assistant Extension",
    },
  })
  .catch(() => process.exit(1));

// Build popup script
esbuild
  .build({
    ...baseConfig,
    entryPoints: [path.join(srcDir, "popup", "index.ts")],
    outfile: path.join(distDir, "popup", "index.js"),
  })
  .catch(() => process.exit(1));

// Copiar archivos estáticos
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copiar CSS
fs.copyFileSync(
  path.join(srcDir, "content", "styles.css"),
  path.join(distDir, "content", "styles.css")
);
fs.copyFileSync(
  path.join(srcDir, "popup", "styles.css"),
  path.join(distDir, "popup", "styles.css")
);

// Copiar HTML
fs.copyFileSync(
  path.join(srcDir, "popup", "index.html"),
  path.join(distDir, "popup", "index.html")
);

// Copiar manifest.json
fs.copyFileSync(
  path.join(extensionDir, "manifest.json"),
  path.join(distDir, "manifest.json")
);

// Copiar public assets
if (fs.existsSync(path.join(extensionDir, "public"))) {
  copyRecursive(
    path.join(extensionDir, "public"),
    path.join(distDir, "public")
  );
}

console.log("✅ Extension build complete!");
console.log(`📦 Output: ${distDir}`);

