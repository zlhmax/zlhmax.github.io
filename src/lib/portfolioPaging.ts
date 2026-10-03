import portfolio_config from "@/portfolio-config.json";
import { parse } from "date-fns";

/**
 * Travel（portfolio）列表分页工具（2026-10-02：按 Eddy 要求，用与 Blog 相同的方法加分页）
 * - 每页篇数：Eddy 指定 = 6
 * - 第 1 页 = /portfolio/，第 N 页 = /portfolio/page/N/
 */
export const PORTFOLIO_PER_PAGE = 6;

/** 全部作品集条目，按日期倒序（列表页与分页页共用） */
export function getSortedPortfolioItems() {
  return [...portfolio_config].sort((a, b) => {
    const dateA = parse(a.data.date, "dd-MM-yyyy", new Date());
    const dateB = parse(b.data.date, "dd-MM-yyyy", new Date());
    return dateB.getTime() - dateA.getTime();
  });
}

/** 总页数（至少 1） */
export function getPortfolioTotalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PORTFOLIO_PER_PAGE));
}
