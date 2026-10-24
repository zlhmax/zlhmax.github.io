"use client";

import { useState, useEffect } from "react";

/**
 * 主题风格切换开关 —— 滑动式（版式对齐 chopstack.com 的 .theme-switch）
 *
 * 切换动效：圆形扩散（移植自 hanityx… 修正：来自 kannansuresh/chirping-astro）
 *   点击时以光标为圆心，用 View Transitions API 做 clip-path: circle() 扩散：
 *     · 切到深色 → 深色快照从光标处「展开」（theme-reveal）
 *     · 切到浅色 → 深色快照从光标处「内收」（theme-conceal）
 *   不支持 VT / 用户开启「减少动画」时 → 直接瞬间切换（无动画）
 *
 * 注意：本站使用了 Astro ClientRouter（页面也有 root 视图过渡），
 * 因此动画 CSS 全部以 html[data-theme-anim] 为作用域，
 * 页面跳转的默认淡入淡出不受影响。
 */

const DURATION = 520;

export default function ThemeToggle() {
  const [theme, setThemeState] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  /** 同步写入 DOM（必须在 startViewTransition 的回调里同步执行，否则快照抓不到） */
  const commitTheme = (newTheme: string) => {
    const root = document.documentElement;
    root.classList.toggle("dark", newTheme === "dark");
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  const applyTheme = (newTheme: string, origin?: { x: number; y: number }) => {
    type VTDocument = Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const doc = document as VTDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof doc.startViewTransition !== "function" || reduceMotion || !origin) {
      commitTheme(newTheme);
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--theme-x", `${origin.x}px`);
    root.style.setProperty("--theme-y", `${origin.y}px`);
    const dx = Math.max(origin.x, window.innerWidth - origin.x);
    const dy = Math.max(origin.y, window.innerHeight - origin.y);
    // +100px 安全余量，避免高分屏/超大视口边缘闪一下
    root.style.setProperty("--theme-radius", `${Math.hypot(dx, dy) + 100}px`);
    root.dataset.themeAnim = newTheme === "dark" ? "to-dark" : "to-light";

    const transition = doc.startViewTransition(() => {
      commitTheme(newTheme);
    });
    transition.finished.finally(() => {
      delete root.dataset.themeAnim;
      root.style.removeProperty("--theme-x");
      root.style.removeProperty("--theme-y");
      root.style.removeProperty("--theme-radius");
    });
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const origin = {
          x: event.clientX || rect.left + rect.width / 2,
          y: event.clientY || rect.top + rect.height / 2,
        };
        applyTheme(isDark ? "light" : "dark", origin);
      }}
      className="theme-switch"
      data-theme-duration={DURATION}
    >
      <span className="theme-switch__knob" aria-hidden="true">
        <svg className="theme-icon-sun" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5 3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.25" />
        </svg>
        <svg className="theme-icon-moon" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 14.2A7.4 7.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2Z"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
