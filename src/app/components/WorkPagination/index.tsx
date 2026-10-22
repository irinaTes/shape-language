import { FC } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/app/utils/utils";
import type { WorkNavItem } from "@/slices/WorkHero";

type Props = { prev?: WorkNavItem; next?: WorkNavItem };

// Previous / next project cards shown at the bottom of a work page
const WorkPagination: FC<Props> = ({ prev, next }) => {
  // With only two projects both sides point to the same one, so keep just "next"
  const showPrev = prev && prev.url !== next?.url;
  if (!showPrev && !next) return null;

  return (
    <nav
      aria-label="More projects"
      className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 py-16 md:py-24 px-6 md:px-20"
    >
      {showPrev && <ProjectCard item={prev} direction="prev" />}
      {next && <ProjectCard item={next} direction="next" className={cn(!showPrev && "md:col-start-2")} />}
    </nav>
  );
};

const ProjectCard: FC<{ item: WorkNavItem; direction: "prev" | "next"; className?: string }> = ({
  item,
  direction,
  className,
}) => {
  const isPrev = direction === "prev";
  return (
    <Link href={item.url} className={cn("group block", className)} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] transition-colors duration-300 group-hover:border-[var(--cyber-cyan)]">
        {item.image?.url && (
          <PrismicNextImage
            field={item.image}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            alt=""
          />
        )}
      </div>
      <div className={cn("mt-4 flex flex-col gap-1", isPrev ? "items-start text-left" : "items-end text-right")}>
        <span
          className="flex items-center gap-2 [font-family:var(--font-space-mono)] text-[10px] md:text-[11px] uppercase tracking-[0.2em]"
          style={{ color: "var(--cyber-cyan)" }}
        >
          {isPrev && <Arrow direction="prev" />}
          {isPrev ? "Previous project" : "Next project"}
          {!isPrev && <Arrow direction="next" />}
        </span>
        {item.title && (
          <span className="text-2xl md:text-3xl font-medium text-white transition-opacity group-hover:opacity-80">
            {item.title}
          </span>
        )}
      </div>
    </Link>
  );
};

const Arrow: FC<{ direction: "prev" | "next" }> = ({ direction }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={cn(
      "h-4 w-4 transition-transform duration-300",
      direction === "prev" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
    )}
  >
    {direction === "prev" ? (
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
);

export default WorkPagination;
