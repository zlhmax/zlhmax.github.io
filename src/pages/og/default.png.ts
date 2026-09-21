import { generateOGImage } from "@/lib/og";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const png = await generateOGImage({
    title: "lhZhang",
    description:
      "lhZhang 的个人作品集与随笔 —— 项目、文章，以及值得想明白的事。现居深圳。",
  });
  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
};
