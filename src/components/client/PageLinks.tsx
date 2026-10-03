"use client";

import { cn } from "@/lib/utils";

/**
 * 通用「静态分页」控件（2026-10-02）
 * 外观与站内筛选工具栏按钮（.filter-icon-btn）完全一致：
 *   - 尺寸 size-[25.6px]（实测 25.59×25.59）· 圆角 rounded-[8px] · 间距 gap-2(8px)
 *   - 常态 = 白底 + 1px 边框；当前页 = 无边框 + bg-muted；禁用 = 无边框 + muted 底 + 更浅的字
 *   - 悬停 = 边框混入 --link-hover + 上浮 2px
 * 路径：第 1 页 = `{base}/`，第 N 页 = `{base}/page/{N}/`
 */
export function PageLinks({
  current,
  total,
  base,
  label = "Pagination",
  className,
}: {
  current: number;
  total: number;
  /** 列表根路径，如 "/blog" 或 "/portfolio" */
  base: string;
  label?: string;
  className?: string;
}) {
  if (total <= 1) return null;

  const hrefOf = (p: number) => (p === 1 ? `${base}/` : `${base}/page/${p}/`);
  const baseCls =
    "inline-flex size-[25.6px] items-center justify-center rounded-[8px] border text-[12px] leading-none transition-all duration-150";
  const idle =
    "border-border bg-background text-muted-foreground hover:-translate-y-0.5 hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)]";
  const cur = "border-transparent bg-muted text-foreground";
  const dis = "border-transparent bg-muted text-muted-foreground/40 pointer-events-none";
  const navBtn = "w-auto px-2.5";

  return (
    <nav
      className={cn(
        "mt-6 flex items-center justify-between border-t border-border pt-6",
        className
      )}
      aria-label={label}
    >
      <a
        href={current > 1 ? hrefOf(current - 1) : undefined}
        aria-disabled={current === 1}
        rel="prev"
        className={cn(baseCls, navBtn, current === 1 ? dis : idle)}
      >
        Previous
      </a>

      <div className="flex items-center gap-2" aria-label={`Page ${current} of ${total}`}>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <a
            key={p}
            href={hrefOf(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(baseCls, p === current ? cur : idle)}
          >
            {p}
          </a>
        ))}
      </div>

      <a
        href={current < total ? hrefOf(current + 1) : undefined}
        aria-disabled={current === total}
        rel="next"
        className={cn(baseCls, navBtn, current === total ? dis : idle)}
      >
        Next
      </a>
    </nav>
  );
}
