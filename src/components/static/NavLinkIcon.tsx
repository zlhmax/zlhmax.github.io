// 参考站 Kanade-Astro 导航「友链」前的小图标（MingCute `link-3-line`，MIT 许可）
// 2026-10-02：Eddy 要求把本站导航 Travel 前的图标换成这一枚 → 原样复刻（stroke=currentColor 跟随文字色）
export function NavLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M12 14a4 4 0 0 0 0-8H6a4 4 0 0 0-1 7.874M12 10a4 4 0 0 0 0 8h6a4 4 0 0 0 1-7.874"
      />
    </svg>
  );
}
