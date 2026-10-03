"use client";

import { PortfolioCard } from "@/components/client/PortfolioCard";
import { PageLinks } from "@/components/client/PageLinks";
import type { portfolioConfig } from "@/lib/types";
import { FilterControls, useFilter } from "@/hooks/useFilter";

export default function FilterPortfolio({
  items,
  pageInfo,
}: {
  items: portfolioConfig[];
  /** 静态分页信息（Astro 构建期给定）；不传则不显示分页 */
  pageInfo?: { current: number; total: number };
}) {
  const filter = useFilter(items, "portfolio");
  const { filteredAndSortedItems } = filter;

  return (
    <div className="flex flex-col gap-3 animation">
      <FilterControls filter={filter} />

      {filteredAndSortedItems.length === 0 ? (
        <div className="flex items-center justify-center border border-border p-6">
          <p className="paragraph">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border border-border p-6">
          {filteredAndSortedItems.map((item) => (
            <PortfolioCard key={item.id} item={item as portfolioConfig} />
          ))}

          {/* 分页控件：在卡片外框线内部、最后一张卡片之后（2 列网格需跨满整行） */}
          {pageInfo && (
            <PageLinks
              current={pageInfo.current}
              total={pageInfo.total}
              base="/portfolio"
              label="Travel pagination"
              className="col-span-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
