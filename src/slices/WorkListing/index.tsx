import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { AnimatedText, AnimatedImage, AnimatedCard } from "./AnimatedCard";
import GlowCard from "./GlowCard";

/**
 * Props for `WorkListing`.
 */
export type WorkListingProps = SliceComponentProps<Content.WorkListingSlice>;

// Predefined card configurations for scattered positioning
// Mobile: full width, centered | Desktop: varied widths and positions
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

// Simple hash function to get consistent "random" index based on item id
function getConfigIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % cardConfigs.length;
}

/**
 * Component for "WorkListing" Slices.
 */
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
      className="w-full flex flex-col gap-6 md:gap-30 py-16 md:py-24 px-6 md:px-20"
    >
      {workItems.map((item, index) => {
        const config = cardConfigs[getConfigIndex(item.id)];
        return (
          <AnimatedCard key={item.id} index={index} className={`${config.width} ${config.marginLeft} md:min-w-[300px] max-w-[1200px]`}>
              <PrismicNextLink
                document={item}
                className="block group"
              >
                <GlowCard className="flex flex-col p-2 md:p-10 mb-10 overflow-hidden border border-white/10 rounded-xl glow-card transition-all duration-500 bg-white/[0.03]">
                  <AnimatedImage>
                    <PrismicNextImage
                      field={item.data.main_image}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 85vw"
                      priority={index === 0}
                    />
                  </AnimatedImage>
                  <div className="border-t border-white/10 px-6 py-4 mt-4">
                    <div className="flex justify-between items-start font-medium">
                      <AnimatedText delay={0.2}>
                        <h2 className="text-lg md:text-xl">
                          {item.data.main_title}
                        </h2>
                      </AnimatedText>
                      {item.data.year && (
                        <AnimatedText delay={0.3}>
                          <span className="text-lg md:text-xl text-white/50">
                            {item.data.year}
                          </span>
                        </AnimatedText>
                      )}
                    </div>
                    <AnimatedText className="font-normal text-[14px] mt-2 text-white/60" delay={0.4}>
                      <PrismicRichText field={item.data.main_description} />
                    </AnimatedText>
                  </div>
                </GlowCard>
              </PrismicNextLink>
            </AnimatedCard>
        );
      })}
    </section>
  );
};

export default WorkListing;
