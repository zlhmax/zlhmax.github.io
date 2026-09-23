import { getCollection } from "astro:content";

/** 去掉 Markdown/代码里的非正文内容，避免把代码块算进"写下的字" */
const strip = (s: string) =>
  s
    .replace(/```[\s\S]*?```/g, " ") // 围栏代码块
    .replace(/`[^`]*`/g, " ") // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留文字
    .replace(/<[^>]+>/g, " ") // HTML 标签
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ") // 标题符号
    .replace(/^\s{0,3}>\s?/gm, " ") // 引用符号
    .replace(/^\s{0,3}[-*+]\s+/gm, " "); // 列表符号

/** 汉字按"字"计，英文/数字按"词"计（中文博客通用口径） */
export function countWords(text: string): number {
  const t = strip(text);
  const cjk = (t.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/g) ?? []).length;
  const latin = (t.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
  return cjk + latin;
}

/** 全部已发布文章的字数合计（构建时计算，加文章自动更新） */
export async function getTotalWords(): Promise<number> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.reduce((sum, p) => sum + countWords(p.body ?? ""), 0);
}

/** 千分位，避免依赖运行环境的 ICU 数据 */
export function formatWords(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
