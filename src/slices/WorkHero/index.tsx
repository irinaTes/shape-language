"use client";
import { FC } from "react";
import { Content, ImageField } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/app/utils/utils";

export type WorkNavItem = { url: string; title: string; image?: ImageField };
export type WorkHeroContext = { prev?: WorkNavItem; next?: WorkNavItem };

/**
 * Props for `WorkHero`.
 */
export type WorkHeroProps = SliceComponentProps<Content.WorkHeroSlice, WorkHeroContext | undefined>;

/**
 * Component for "WorkHero" Slices.
 */
const WorkHero: FC<WorkHeroProps> = ({ slice, context }) => {
  const { background_image, title, description } = slice.primary
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full -mt-[128px] relative min-h-[100vh] lg:min-h-[80vh] overflow-hidden flex flex-col justify-center items-center text-white px-4 md:px-10 py-32 lg:py-40"
    >
      {/* Animated background image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: background_image?.url ? `url(${background_image.url})` : undefined
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Bottom glow fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 60%, rgba(0,0,0,0.6))' }}
      />

      {/* Matte glass effect overlay */}
      <motion.div
        className="absolute inset-0 backdrop-blur-md bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      />

      {/* Animated text content */}
      <motion.div
        className={cn(
          "relative z-10 flex flex-col items-center w-full",
          // Keep the text clear of the side arrows (arrow: 40px inset + 48px wide)
          (context?.prev || context?.next) && "md:px-16"
        )}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.3,
              delayChildren: 0.5
            }
          }
        }}
      >
        {title && (
          <motion.div
            className="text-center w-full max-w-4xl"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
              }
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          </motion.div>
        )}
        {description && (
          <motion.div
            className="text-lg md:text-xl text-center w-full max-w-full lg:max-w-7xl "
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
              }
            }}
          >
            <PrismicRichText field={description} />
          </motion.div>
        )}
      </motion.div>

      {/* Previous / next project */}
      {context?.prev && <WorkNavArrow item={context.prev} direction="prev" />}
      {context?.next && <WorkNavArrow item={context.next} direction="next" />}
    </section>
  );
};

// Same round glass button as ScrollToTop, pinned to the hero's side edges
const WorkNavArrow: FC<{ item: WorkNavItem; direction: "prev" | "next" }> = ({ item, direction }) => {
  const isPrev = direction === "prev";
  return (
    <motion.div
      className={cn(
        // Bottom corners on mobile (clear of the full-width title), vertically centered on desktop
        "group/nav absolute z-20 bottom-8 md:top-0 md:bottom-0 flex items-center",
        isPrev ? "left-4 md:left-10" : "right-4 md:right-10"
      )}
      initial={{ opacity: 0, x: isPrev ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
    >
      <Link
        href={item.url}
        aria-label={`${isPrev ? "Previous" : "Next"} project${item.title ? `: ${item.title}` : ""}`}
        className={cn(
          "h-12 w-12 rounded-full",
          "bg-white/10 backdrop-blur-md border",
          "hover:bg-white/20 cursor-pointer",
          "flex items-center justify-center shadow-lg",
          "transition-all duration-300"
        )}
        style={{ borderColor: "var(--cyber-cyan)", color: "var(--cyber-cyan)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {isPrev ? (
            <>
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </>
          ) : (
            <>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </>
          )}
        </svg>
      </Link>

      {/* Preview card, shown on hover / keyboard focus (desktop only) */}
      <div
        aria-hidden
        className={cn(
          "hidden md:block absolute top-1/2 w-64 pointer-events-none",
          isPrev ? "left-full ml-4" : "right-full mr-4",
          "opacity-0 -translate-y-1/2 scale-95 transition-all duration-300 ease-out",
          isPrev ? "-translate-x-2" : "translate-x-2",
          "group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:translate-x-0",
          "group-focus-within/nav:opacity-100 group-focus-within/nav:scale-100 group-focus-within/nav:translate-x-0"
        )}
      >
        <div
          className="overflow-hidden rounded-xl border bg-neutral-950 shadow-lg"
          style={{ borderColor: "var(--cyber-cyan)" }}
        >
          {item.image?.url && (
            <div className="relative aspect-video overflow-hidden">
              <PrismicNextImage field={item.image} fill sizes="256px" className="object-cover" alt="" />
            </div>
          )}
          <div className={cn("px-4 py-3", isPrev ? "text-left" : "text-right")}>
            <p
              className="[font-family:var(--font-space-mono)] text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "var(--cyber-cyan)" }}
            >
              {isPrev ? "Previous project" : "Next project"}
            </p>
            {item.title && <p className="mt-1 text-base font-medium text-white leading-snug">{item.title}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkHero;
