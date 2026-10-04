"use client";

import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine, RiFullscreenLine, RiFullscreenExitLine } from "@remixicon/react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";

interface GalleryImage {
  src: string;
  alt: string;
}

type GalleryItem = { type: "image"; src: string; alt: string } | { type: "video"; videoId: string; alt: string };

/**
 * 图片画廊
 * ── 视觉对齐参考站 astro-wanderer（MIT）：圆角舞台 + 覆盖式 42px 圆形箭头
 *    + 56×42 缩略图（选中主题色描边）+ 「左计数 / 右缩略图」meta 条 + 弹入动画
 * ── 功能对齐参考站：点击放大灯箱、键盘导航（Esc / ← / →）、全屏、背景模糊
 * ── 保留本站既有：照片按原始比例零留白、容器四周 12px 内衬
 */
export default function PortfolioGallery({ images, videoId, title }: { images: GalleryImage[]; videoId?: string | null; title?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  const items = useMemo<GalleryItem[]>(() => {
    const result: GalleryItem[] = [];
    if (videoId) {
      result.push({ type: "video", videoId, alt: title ? `${title} demo video` : "Demo video" });
    }
    images.forEach((img) => result.push({ type: "image", ...img }));
    return result;
  }, [images, videoId, title]);

  const scrollThumbTo = useCallback((index: number) => {
    const el = thumbRef.current;
    if (el) {
      const child = el.children[index] as HTMLElement | undefined;
      if (child) child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  const goNext = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % items.length;
      scrollThumbTo(next);
      return next;
    });
    setAnimKey((k) => k + 1);
  }, [items.length, scrollThumbTo]);

  const goPrev = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => {
      const next = (prev - 1 + items.length) % items.length;
      scrollThumbTo(next);
      return next;
    });
    setAnimKey((k) => k + 1);
  }, [items.length, scrollThumbTo]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setIsFullscreen(false);
  }, []);

  // 灯箱打开时：键盘导航（Esc / ← / →）+ 锁定页面滚动
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, goNext, goPrev, closeLightbox]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        if (e.deltaY > 0) goNext();
        else if (e.deltaY < 0) goPrev();
      }
    },
    [goNext, goPrev],
  );

  const handleThumbWheel = useCallback((e: React.WheelEvent) => {
    if (!e.shiftKey) {
      e.stopPropagation();
      if (thumbRef.current) thumbRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  if (items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <div onWheel={handleWheel} className="select-none">
      {/* 舞台：保留「照片原始比例零留白 + 四周 12px 内衬」；新增圆角 / 边框 / 阴影（对齐参考站） */}
      <div className="relative w-[calc(82.5%_+_24px)] max-w-full mx-auto">
        <div className="relative p-[12px] rounded-2xl border border-border bg-muted overflow-hidden shadow-sm">
          <div
            className={current.type === "image" ? "cursor-zoom-in" : undefined}
            onClick={() => {
              if (current.type === "image") setLightboxOpen(true);
            }}
          >
            {current.type === "image" ? (
              <img
                key={`${current.src}-${animKey}`}
                src={current.src}
                alt={current.alt}
                draggable={false}
                className="w-full h-auto object-contain carousel-pop"
              />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${current.videoId}`}
                title={current.alt}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video rounded-xl"
              />
            )}
          </div>

        </div>
          {/* 覆盖式圆形箭头（42px，位于舞台两侧，对齐参考站） */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute -left-[58px] top-1/2 -translate-y-1/2 z-[5] size-[42px] grid place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm cursor-pointer transition-transform duration-150 hover:scale-[1.08] active:scale-95"
                aria-label="Previous image"
              >
                <RiArrowLeftSLine className="size-[22px]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute -right-[58px] top-1/2 -translate-y-1/2 z-[5] size-[42px] grid place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm cursor-pointer transition-transform duration-150 hover:scale-[1.08] active:scale-95"
                aria-label="Next image"
              >
                <RiArrowRightSLine className="size-[22px]" />
              </button>
            </>
          )}
      </div>

      {/* meta 条：左计数（等宽字体，无边框）+ 右缩略图（56×42，选中主题色描边） */}
      {items.length > 1 && (
        <div className="w-[calc(82.5%_+_24px)] max-w-full mx-auto mt-3 flex items-center justify-between gap-4">
          <span className="font-mono text-[0.85rem] text-muted-foreground shrink-0">
            {currentIndex + 1} / {items.length}
          </span>
          <div
            ref={thumbRef}
            onWheel={handleThumbWheel}
            className="flex gap-2 overflow-x-auto max-w-[70%] pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item, index) => (
              <button
                key={item.type === "video" ? item.videoId : item.src}
                onClick={() => {
                  setCurrentIndex(index);
                  scrollThumbTo(index);
                  setAnimKey((k) => k + 1);
                }}
                className={`shrink-0 w-14 h-[42px] cursor-pointer overflow-hidden relative rounded-md border-2 transition-[border-color,opacity] duration-200 ${
                  index === currentIndex ? "border-[color:var(--color-link)]" : "border-transparent hover:opacity-85"
                }`}
                aria-label={`Slide ${index + 1}`}
              >
                {item.type === "image" ? (
                  <img loading="lazy" width={1920} src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <img
                      loading="lazy"
                      width={1920}
                      src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 grid place-items-center bg-black/20">
                      <span className="text-white text-base leading-none">▶</span>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 灯箱：点击放大 + 键盘（Esc / ← / →）+ 全屏 + 背景模糊（对齐参考站） */}
      {lightboxOpen && current.type === "image" && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(6,8,12,0.92)] backdrop-blur-[6px]"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-6 text-white/85 hover:text-white transition-transform duration-150 hover:scale-110 cursor-pointer"
            aria-label="Close"
          >
            <RiCloseLine className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen((v) => !v);
            }}
            className="absolute top-5 right-[4.5rem] text-white/85 hover:text-white transition-transform duration-150 hover:scale-110 cursor-pointer"
            aria-label="Toggle full screen"
          >
            {isFullscreen ? <RiFullscreenExitLine className="size-6" /> : <RiFullscreenLine className="size-6" />}
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/85 hover:text-white transition-transform duration-150 hover:scale-110 cursor-pointer"
                aria-label="Previous"
              >
                <RiArrowLeftSLine className="size-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/85 hover:text-white transition-transform duration-150 hover:scale-110 cursor-pointer"
                aria-label="Next"
              >
                <RiArrowRightSLine className="size-7" />
              </button>
            </>
          )}

          <figure
            className={isFullscreen ? "m-0 w-screen h-screen grid place-items-center bg-black" : "m-0 max-w-[min(1200px,90vw)] max-h-[84vh]"}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt}
              className={isFullscreen ? "w-full h-full object-contain" : "max-w-full max-h-[84vh] rounded-lg shadow-2xl"}
            />
          </figure>

          {items.length > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.9rem] text-white/80">
              {currentIndex + 1} / {items.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
