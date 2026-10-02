"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/**
 * Blog 列表分页控件（2026-10-02）
 * 外观对齐参考站 astro.navfolio.site：左侧 Previous、右侧页码方块 + Next，
 * 上方一条分界线，圆角 6px、间距 16px、字号 13px。
 * 说明：这是**前端分页** —— 所有文章一次性加载，筛选/排序对全部文章有效，仅切换当前显示页。
 */
export function BlogPagination({ currentPage, totalPages, onChange }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const base = "inline-flex h-9 items-center justify-center rounded-[6px] border text-[13px] transition-colors";
  const idle = "cursor-pointer border-border/60 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground";
  const current = "border-border bg-background text-foreground";
  const disabled = "cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground/40";
  // 与参考站一致：Previous / Next 定宽 98px
  const navBtn = "min-w-[98px] px-5";

  return (
    <nav className="mt-[34px] mb-10 flex items-center justify-between border-t border-border pt-6" aria-label="Blog pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className={cn(base, navBtn, currentPage === 1 ? disabled : idle)}
      >
        Previous
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4" aria-label={`Page ${currentPage} of ${totalPages}`}>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(base, "w-9", p === currentPage ? current : idle)}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
          className={cn(base, navBtn, currentPage === totalPages ? disabled : idle)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
