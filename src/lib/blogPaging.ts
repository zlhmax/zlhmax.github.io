import { getCollection, type CollectionEntry } from "astro:content";
import { parse } from "date-fns";

/**
 * Blog 列表分页工具（2026-10-02：按 Eddy 要求照搬参考站 astro.navfolio.site 的静态分页）
 * - 每页篇数：Eddy 指定 = 8（参考站为 6，本站按需求调整为 8）
 * - 第 1 页 = /blog/，第 N 页 = /blog/page/N/
 */
export const POSTS_PER_PAGE = 8;

export type BlogPost = CollectionEntry<"blog">;

/** 取全部非草稿文章并按日期倒序（列表页与分页页共用，避免两处逻辑漂移） */
export async function getSortedBlogPosts(): Promise<BlogPost[]> {
  return (await getCollection("blog"))
    .filter((blog) => !blog.data.draft)
    .sort((a, b) => {
      const aDate = parse(a.data.date, "dd-MM-yyyy", new Date());
      const bDate = parse(b.data.date, "dd-MM-yyyy", new Date());
      return bDate.getTime() - aDate.getTime();
    });
}

/** 总页数（至少 1） */
export function getTotalPages(total: number): number {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

/** 第 1 页的路径 = /blog/，其余 = /blog/page/N/ */
export function pageHref(page: number): string {
  return page === 1 ? "/blog/" : `/blog/page/${page}/`;
}
