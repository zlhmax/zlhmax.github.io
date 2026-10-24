// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import rehypeExternalLinks from "rehype-external-links";
import remarkMath from "remark-math";
import remarkSpoiler from "./src/plugins/remark-spoiler.mjs";
import rehypeKatex from "rehype-katex";
import rehypeFigure from "rehype-figure";
import mermaid from "astro-mermaid";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },

  integrations: [
    mermaid({
      theme: "neutral",
      autoTheme: true,
    }),
    expressiveCode({
      // 沿用现有 Shiki 配色，视觉延续
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      // 深浅色跟随本站 .dark（由主题切换写入 <html class="dark">）
      themeCssSelector: (theme) => (theme.name === "github-dark" ? "[data-theme='dark']" : "[data-theme='light']"),
      styleOverrides: {
        borderRadius: "8px",
        borderColor: "var(--border)",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.875rem",
      },
    }),
    react(),
    sitemap(),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
    remarkPlugins: [remarkSpoiler, remarkMath],
    rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] }], rehypeKatex, rehypeFigure],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  site: "https://www.lhzhang.cn",
});
