"use client";

import * as React from "react";
import { BlogCard } from "@/components/client/BlogCard";
import { BlogPagination } from "@/components/client/BlogPagination";
import type { blogConfig } from "@/lib/types";
import { FilterControls, useFilter } from "@/hooks/useFilter";
import { cn } from "@/lib/utils";

// 每页篇数（2026-10-02：Eddy 指定 8；参考站 astro.navfolio.site 为 6）
const POSTS_PER_PAGE = 8;

/**
 * 静态分页控件（2026-10-02 Eddy 要求：置于文章卡外框线**内部**、最后一条文章下方）
 * - 数据来自 Astro 构建期的静态分页（pageInfo），用真链接跳转 /blog/page/N/
 * - 视觉沿用站内语言：圆角 6px / 高 36px / 13px / 上方分隔线 / 当前页 aria-current
 */
function BlogPageLinks({ current, total }: { current: number; total: number }) {
  const hrefOf = (p: number) => (p === 1 ? "/blog/" : `/blog/page/${p}/`);
  // 2026-10-02 Eddy 要求：按钮显示效果与**大小**都与筛选工具栏按钮（.filter-icon-btn）一致
  //   尺寸 size-[25.6px] · 圆角 8px · 间距 gap-2(8px)
  //   常态   = 白底 + 1px 边框（outline）
  //   当前页 = 无边框 + muted 底（secondary）
  //   禁用   = 无边框 + muted 底 + 更浅的字
  // 悬停沿用工具栏语言：边框混入 --link-hover + 上浮 2px
  const base =
    "inline-flex size-[25.6px] items-center justify-center rounded-[8px] border text-[12px] leading-none transition-all duration-150";
  const idle =
    "border-border bg-background text-muted-foreground hover:-translate-y-0.5 hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)]";
  const cur = "border-transparent bg-muted text-foreground";
  const dis = "border-transparent bg-muted text-muted-foreground/40 pointer-events-none";
  const navBtn = "w-auto px-2.5";

  return (
    <nav
      className="mt-6 flex items-center justify-between border-t border-border pt-6"
      aria-label="Blog pagination"
    >
      <a
        href={current > 1 ? hrefOf(current - 1) : undefined}
        aria-disabled={current === 1}
        rel="prev"
        className={cn(base, navBtn, current === 1 ? dis : idle)}
      >
        Previous
      </a>

      <div className="flex items-center gap-2" aria-label={`Page ${current} of ${total}`}>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <a
            key={p}
            href={hrefOf(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(base, p === current ? cur : idle)}
          >
            {p}
          </a>
        ))}
      </div>

      <a
        href={current < total ? hrefOf(current + 1) : undefined}
        aria-disabled={current === total}
        rel="next"
        className={cn(base, navBtn, current === total ? dis : idle)}
      >
        Next
      </a>
    </nav>
  );
}

export default function FilterBlog({
  items,
  pageInfo,
}: {
  items: blogConfig[];
  /** 静态分页信息（Astro 构建期给定）；不传则回退到内置的前端分页 */
  pageInfo?: { current: number; total: number };
}) {
  const filter = useFilter(items, "blog");
  const { filteredAndSortedItems, category, selectedTags, sortOrder } = filter;

  // 前端分页：文章全量在前端，筛选/排序作用于**全部**文章，这里只决定当前显示哪一页
  // ⚠️ 静态分页（pageInfo）下，传进来的 items 已经是「本页」的文章 → 不能再切一次（否则会丢文章）
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = pageInfo
    ? filteredAndSortedItems
    : filteredAndSortedItems.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  // 筛选/排序一变化就回到第 1 页（避免停留在空白页）
  React.useEffect(() => {
    setPage(1);
  }, [category, selectedTags, sortOrder]);

  return (
    <div className="flex flex-col gap-3 animation">
      <FilterControls filter={filter} />

      {filteredAndSortedItems.length === 0 ? (
        <div className="flex items-center justify-center border border-border p-6">
          <p className="paragraph">No blogs found.</p>
        </div>
      ) : (
        <div className="space-y-0 border border-border p-6">
          {pageItems.map((item) => (
            <BlogCard key={item.id} item={item as blogConfig} />
          ))}

          {/* 分页控件：在文章卡外框线内部、最后一条文章之后 */}
          {pageInfo ? (
            pageInfo.total > 1 ? (
              <BlogPageLinks current={pageInfo.current} total={pageInfo.total} />
            ) : null
          ) : (
            <BlogPagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
}

