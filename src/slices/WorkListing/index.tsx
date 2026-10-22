import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { AnimatedText, AnimatedImage, AnimatedCard } from "./AnimatedCard";

export type WorkListingProps = SliceComponentProps<Content.WorkListingSlice>;

const cardConfigs = [
  { width: "w-full md:w-[85%]", marginLeft: "ml-0 md:ml-[0%]" },
  { width: "w-full md:w-[80%]", marginLeft: "ml-0 md:ml-[20%]" },
  { width: "w-full md:w-[88%]", marginLeft: "ml-0 md:ml-[6%]" },
  { width: "w-full md:w-[82%]", marginLeft: "ml-0 md:ml-[0%]" },
  { width: "w-full md:w-[90%]", marginLeft: "ml-0 md:ml-[10%]" },
  { width: "w-full md:w-[78%]", marginLeft: "ml-0 md:ml-[22%]" },
  { width: "w-full md:w-[86%]", marginLeft: "ml-0 md:ml-[4%]" },
  { width: "w-full md:w-[83%]", marginLeft: "ml-0 md:ml-[17%]" },
];

function getConfigIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % cardConfigs.length;
}

const WorkListing: FC<WorkListingProps> = async ({ slice }) => {
  const client = createClient();

  const workItems = await client.getAllByType("work_content", {
    fetch: [
      "work_content.main_title",
      "work_content.main_image",
      "work_content.main_description",
      "work_content.main_video_url",
      "work_content.year",
    ],
  });

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      id="work"
      className="scroll-mt-24 w-full flex flex-col gap-14 md:gap-30 py-16 md:py-24 px-6 md:px-20"
    >
      {workItems.reverse().map((item, index) => {
        const config = cardConfigs[getConfigIndex(item.id)];
        const ix = `§ ${String(index + 1).padStart(2, "0")}`;

        return (
          <AnimatedCard
            key={item.id}
            index={index}
            className={`${config.width} ${config.marginLeft} md:min-w-[18.75rem] max-w-[75rem]`}
          >
            <PrismicNextLink document={item} className="block group" style={{ textDecoration: "none", color: "inherit" }}>

              {/* ── Image frame ───────────────────────────────────────── */}
              <div className="relative aspect-video overflow-hidden border border-white/[0.08] transition-colors duration-300 group-hover:border-[var(--cyber-cyan)]">

                {/* bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65))" }}
                />

                {/* index — top left */}
                <span
                  className="absolute top-4 left-4 z-20 text-white/70 hidden lg:block"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}
                >
                  {ix} · {item.data.main_title}
                </span>

                {/* year — top right */}
                {item.data.year && (
                  <span
                    className="absolute top-4 right-4 z-20 text-white/70"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: 10, letterSpacing: "0.24em" }}
                  >
                    {item.data.year}
                  </span>
                )}

                {/* image */}
                <AnimatedImage>
                  <PrismicNextImage
                    field={item.data.main_image}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 768px) 100vw, 85vw"
                    priority={index === 0}
                  />
                </AnimatedImage>

                {/* title + arrow — bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-6 px-6 pb-5">
                  <AnimatedText delay={0.2}>
                    <h2
                      className="m-0 font-bold text-white transition-colors duration-300 group-hover:text-[var(--cyber-cyan)]"
                      style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 0.9, letterSpacing: "-0.04em" }}
                    >
                      {item.data.main_title}
                    </h2>
                  </AnimatedText>

                  {/* arrow box */}
                  <span
                    className="shrink-0 grid place-items-center border border-white/60 transition-all duration-300 group-hover:border-[var(--cyber-cyan)] group-hover:bg-[var(--cyber-cyan)]"
                    style={{ width: 56, height: 56 }}
                    aria-hidden="true"
                  >
                    <span
                      className="relative inline-block transition-transform duration-300 group-hover:translate-x-1 bg-white group-hover:bg-[#0a0d0e]"
                      style={{ width: 22, height: 1 }}
                    >
                      <span
                        className="absolute right-0 -top-[3px] w-[7px] h-[7px] border-t border-r border-white group-hover:border-[#0a0d0e] rotate-45 block"
                      />
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Footer ────────────────────────────────────────────── */}
              <div className="mt-3 flex justify-between items-start gap-8">
                <AnimatedText
                  className="text-white/60 leading-relaxed max-w-[70%] [&_p]:m-0"
                  delay={0.4}
                  style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 14 } as React.CSSProperties}
                >
                  <PrismicRichText field={item.data.main_description} />
                </AnimatedText>
                <span
                  className="text-white/40 shrink-0"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}
                >
                  {ix}
                </span>
              </div>

            </PrismicNextLink>
          </AnimatedCard>
        );
      })}
    </section>
  );
};

export default WorkListing;
