"use client";

import * as React from "react";
import { BlogCard } from "@/components/client/BlogCard";
import { BlogPagination } from "@/components/client/BlogPagination";
import { PageLinks } from "@/components/client/PageLinks";
import type { blogConfig } from "@/lib/types";
import { FilterControls, useFilter } from "@/hooks/useFilter";

// 每页篇数（2026-10-02：Eddy 指定 8；参考站 astro.navfolio.site 为 6）
const POSTS_PER_PAGE = 8;

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

          {/* 分页控件：在文章卡外框线内部、最后一条文章之后（共享组件，外观与筛选工具栏按钮一致） */}
          {pageInfo ? (
            <PageLinks
              current={pageInfo.current}
              total={pageInfo.total}
              base="/blog"
              label="Blog pagination"
            />
          ) : (
            <BlogPagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
}

