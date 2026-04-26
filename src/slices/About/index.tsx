"use client";

import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { motion } from "framer-motion";

export type AboutProps = SliceComponentProps<Content.AboutSlice>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

// ── Corner tick ──────────────────────────────────────────────────────────────
const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const base: React.CSSProperties = { position: "absolute", width: 16, height: 16, borderColor: "var(--cyber-cyan)", borderStyle: "solid", borderWidth: 0, zIndex: 10 };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 },
    tr: { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 },
    bl: { bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 },
    br: { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 },
  };
  return <span aria-hidden="true" style={{ ...base, ...map[pos] }} />;
};

const TIMELINE = [
  { year: "2014 →", title: "Television",     sub: "2D motion · editing" },
  { year: "2018 →", title: "Eye for story",  sub: "timing · framing" },
  { year: "2022 →", title: "CGI · VFX",      sub: "full pipeline" },
  { year: "2026",   title: "Solo short film", sub: "every frame · conscious" },
];

const About: FC<AboutProps> = ({ slice }) => {
  const p = slice.primary;

  const line1 = p.heading_line1 || "Every shape";
  const line2 = p.heading_line2 || "has a language";
  const line3 = p.heading_line3 || "mine speaks.";

  const railItems = [
    { n: "01", t: "Premise" },
    ...slice.items.map((item, i) => ({
      n: item.section_number || `0${i + 2}`,
      t: item.section_title  || "",
    })),
  ];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full px-8 lg:px-16 xl:px-24 py-16 lg:py-24"
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 pb-14 border-b border-white/[0.06]">

        {/* Left — heading */}
        <div className="flex flex-col gap-8">
          <motion.div
            {...fadeIn(0)}
            className="flex gap-6 flex-wrap text-[11px] tracking-[0.18em] uppercase text-white/35"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <span><span className="text-white/80">§ 02</span>&nbsp; About</span>
            {isFilled.keyText(p.role_meta) && (
              <span><span className="text-white/80">ROLE</span>&nbsp; {p.role_meta}</span>
            )}
            <span><span className="text-white/80">OPS</span>&nbsp; Solo studio</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-bold leading-[0.86] tracking-[-0.04em]"
            style={{ fontSize: "clamp(80px, 8vw + 2vh, 210px)" }}
          >
            <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(0,245,255,0.2)" }}>
              {line1}
            </span>
            <span className="block text-white/90">
              {line2}
              <span
                aria-hidden="true"
                className="cf-blink inline-block rounded-full ml-2 align-middle"
                style={{ width: 13, height: 13, background: "var(--cyber-cyan)", boxShadow: "0 0 12px var(--cyber-cyan-glow-strong)", marginBottom: 3 }}
              />
            </span>
            <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(0,245,255,0.2)" }}>
              {line3}
            </span>
          </motion.h1>
        </div>

        {/* Right — portrait + id card */}
        <motion.div {...fadeUp(0.2)}>

          {/* Portrait */}
          <div className="relative w-3/4 mx-auto aspect-[4/5] border border-white/[0.08] bg-[#0e1214]">
            <Corner pos="tl" /><Corner pos="tr" />
            <Corner pos="bl" /><Corner pos="br" />
            <div className="absolute inset-0 overflow-hidden">

            {/* label strip */}
            <div
              className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-[10px] tracking-[0.18em] uppercase text-white/40"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              <span className="flex items-center gap-2">
                <span className="cf-pulse cf-blink block rounded-full shrink-0" style={{ width: 6, height: 6, background: "var(--cyber-cyan)" }} aria-hidden="true" />
                <span className="text-white/70">SUBJECT&nbsp;01</span>
              </span>
              <span>PORTRAIT · 4:5 · RAW</span>
            </div>

            {isFilled.image(p.portrait) ? (
              <PrismicNextImage
                field={p.portrait}
                fill
                sizes="(max-width: 1080px) 100vw, 45vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 14px), radial-gradient(ellipse 60% 55% at 50% 42%, rgba(255,255,255,0.05), transparent 70%), #0e1214",
                }}
              >
                {/* crosshair */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                </div>
                {/* center tick */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 border border-[var(--cyber-cyan)] pointer-events-none">
                  <div className="absolute left-1/2 -top-1.5 -bottom-1.5 w-px -translate-x-1/2 bg-[var(--cyber-cyan)]" />
                  <div className="absolute top-1/2 -left-1.5 -right-1.5 h-px -translate-y-1/2 bg-[var(--cyber-cyan)]" />
                </div>
                {/* hint */}
                <div
                  className="absolute left-4 right-4 bottom-4 flex justify-between items-end gap-3 text-[10px] tracking-[0.18em] uppercase text-white/30"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  <span className="leading-relaxed max-w-[60%]">
                    Portrait drops here — <span className="text-[var(--cyber-cyan)]">4 : 5</span> ratio
                  </span>
                  <span>PORTRAIT_01.JPG</span>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Id card */}
          <div
            className="mt-4 border border-white/[0.07] grid grid-cols-2 gap-x-6 gap-y-3.5 p-5 text-[10px] tracking-[0.18em] uppercase text-white/35"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.015), transparent), #080808",
            }}
          >
            {[
              { k: "Name",         v: isFilled.keyText(p.name_text)    ? p.name_text    : "— Your Name" },
              { k: "Discipline",   v: isFilled.keyText(p.discipline)   ? p.discipline   : "CGI · Motion · VFX" },
              { k: "In the field", v: isFilled.keyText(p.in_the_field) ? p.in_the_field : "Since 2014 · 12 yrs" },
              { k: "Status",       v: isFilled.keyText(p.availability) ? p.availability : "Open for 2026" },
            ].map(({ k, v }) => (
              <div key={k}>
                <span className="block text-white/20 mb-1 text-[9px]">{k}</span>
                <span
                  className="text-white/80 text-[13px] normal-case tracking-normal"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16 mt-14 max-w-6xl mx-auto w-full">

        {/* Sticky rail */}
        <motion.aside
          {...fadeIn(0.3)}
          className="lg:sticky lg:top-8 lg:self-start flex flex-wrap lg:flex-col gap-3 lg:gap-0 text-[10px] tracking-[0.2em] uppercase text-white/35"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {railItems.map(({ n, t }, i) => (
            <div
              key={n}
              className={`flex gap-3 py-2.5 border-t border-white/[0.08] items-start leading-relaxed ${i === railItems.length - 1 ? "border-b" : ""}`}
            >
              <span className="text-[var(--cyber-cyan)] min-w-[32px]">{n}</span>
              <span className="text-white/70">{t}</span>
            </div>
          ))}
        </motion.aside>

        {/* Prose */}
        <motion.div {...fadeUp(0.35)} className="max-w-3xl">

          {/* Lede — Premise */}
          {isFilled.richText(p.lede) && (
            <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] gap-8 py-7 border-t border-white/[0.08] items-start">
              <div
                className="text-[10px] tracking-[0.22em] uppercase text-white/35"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <b className="block mb-1.5 font-medium text-sm text-[var(--cyber-cyan)]">01</b>
                Premise
              </div>
              <div
                className="text-white/85 leading-snug tracking-[-0.01em] [&_em]:not-italic [&_em]:text-[var(--cyber-cyan)]"
                style={{ fontSize: "clamp(20px, 2vw, 26px)", fontFamily: "var(--font-space-grotesk)" }}
              >
                <PrismicRichText field={p.lede} />
              </div>
            </div>
          )}

          {/* Dynamic sections */}
          {slice.items.map((item, i) => (
            <div key={i}>
              {isFilled.richText(item.section_content) && (
                <div className="grid grid-cols-1 sm:grid-cols-[90px_1fr] gap-8 py-7 border-t border-white/[0.08] last:border-b items-start">
                  <div
                    className="text-[10px] tracking-[0.22em] uppercase text-white/35"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    <b className="block mb-1.5 font-medium text-sm text-[var(--cyber-cyan)]">
                      {item.section_number || `0${i + 2}`}
                    </b>
                    {item.section_title}
                  </div>
                  <div
                    className="text-white/80 leading-relaxed [&_p+p]:mt-4 [&_strong]:text-white [&_em]:not-italic [&_em]:text-[var(--cyber-cyan)]"
                    style={{ fontSize: 17, fontFamily: "var(--font-space-grotesk)" }}
                  >
                    <PrismicRichText field={item.section_content} />
                  </div>
                </div>
              )}

              {/* Timeline after first section */}
              {i === 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-b border-white/[0.08] mt-6">
                  {TIMELINE.map(({ year, title, sub }, ti) => (
                    <div
                      key={year}
                      className={`p-4 lg:p-5 ${ti < TIMELINE.length - 1 ? "border-r border-white/[0.08]" : ""}`}
                    >
                      <div
                        className="mb-2.5 text-[10px] tracking-[0.22em] uppercase text-[var(--cyber-cyan)]"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {year}
                      </div>
                      <div className="text-white/80 text-[15px] leading-snug" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {title}
                        <small
                          className="block mt-1.5 text-white/40 text-[11px] uppercase tracking-[0.14em]"
                          style={{ fontFamily: "var(--font-space-mono)" }}
                        >
                          {sub}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pull quote */}
          {isFilled.keyText(p.quote) && (
            <div className="mt-2 pt-7 border-t border-white/[0.06]">
              <blockquote
                className="font-medium text-white/90 leading-tight tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(26px, 2.8vw, 38px)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {p.quote.split(/\b(stop)\b/i).map((part, i) =>
                  /^stop$/i.test(part)
                    ? <span key={i} style={{ color: "transparent", WebkitTextStroke: "1.2px rgba(0,245,255,0.3)" }}>{part}</span>
                    : part
                )}
              </blockquote>
              {isFilled.keyText(p.quote_cite) && (
                <cite
                  className="block mt-5 not-italic text-white/30 text-[10px] tracking-[0.22em] uppercase"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {p.quote_cite}
                </cite>
              )}
            </div>
          )}

          {/* CTA */}
          {isFilled.keyText(p.cta_heading) && (
            <div
              className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-7 mt-14 border border-white/[0.08] p-9"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.015), transparent), #080808" }}
            >
              <Corner pos="tl" /><Corner pos="br" />

              <h4
                className="font-semibold text-white/90 tracking-[-0.01em] leading-snug max-w-lg"
                style={{ fontSize: 22, fontFamily: "var(--font-space-grotesk)" }}
              >
                {p.cta_heading}
              </h4>

              {isFilled.link(p.cta_link) && (
                <PrismicNextLink
                  field={p.cta_link}
                  className="cf-submit relative flex shrink-0 items-center gap-4 border border-white/30 px-6 py-4 text-white/80 text-sm font-medium tracking-wide transition-colors duration-300 no-underline"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  <span>Start a transmission</span>
                  <span aria-hidden="true" className="relative inline-block" style={{ width: 24, height: 1, background: "currentColor" }}>
                    <span className="absolute right-0 top-[-3px] w-[7px] h-[7px] border-t border-r border-current rotate-45 block" />
                  </span>
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase text-white/35"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    → CONTACT
                  </span>
                </PrismicNextLink>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
