import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { AnimatedText, AnimatedImage } from "./AnimatedCard";

/**
 * Props for `WorkListing`.
 */
export type WorkListingProps = SliceComponentProps<Content.WorkListingSlice>;

// Predefined card configurations for scattered positioning
// Mobile: full width, centered | Desktop: varied widths and positions
const cardConfigs = [
  { width: "w-full md:w-[70%]", marginLeft: "ml-0 md:ml-[0%]" },
  { width: "w-full md:w-[55%]", marginLeft: "ml-0 md:ml-[45%]" },
  { width: "w-full md:w-[65%]", marginLeft: "ml-0 md:ml-[18%]" },
  { width: "w-full md:w-[60%]", marginLeft: "ml-0 md:ml-[5%]" },
  { width: "w-full md:w-[75%]", marginLeft: "ml-0 md:ml-[25%]" },
  { width: "w-full md:w-[50%]", marginLeft: "ml-0 md:ml-[35%]" },
  { width: "w-full md:w-[68%]", marginLeft: "ml-0 md:ml-[10%]" },
  { width: "w-full md:w-[58%]", marginLeft: "ml-0 md:ml-[42%]" },
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
      className="w-full flex flex-col gap-16 md:gap-40 py-24 md:py-40"
    >
      {workItems.map((item, index) => {
        const config = cardConfigs[getConfigIndex(item.id)];
        return (
          <div
            key={index}
            className="w-full px-4 md:px-12"
          >
            <div className={`${config.width} ${config.marginLeft} md:min-w-[300px] max-w-[1200px]`}>
              <PrismicNextLink
                document={item}
                className="block group"
              >
                <div className="flex flex-col overflow-hidden p-10">
                  <AnimatedImage index={index}>
                    <PrismicNextImage
                      field={item.data.main_image}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </AnimatedImage>
                  <div className="flex justify-between items-start mt-4 px-1 font-medium z-10">
                    <AnimatedText delay={0.2}>
                      <h2 className="text-lg md:text-xl ">
                        {item.data.main_title}
                      </h2>
                    </AnimatedText>
                    {item.data.year && (
                      <AnimatedText delay={0.3}>
                        <span className="text-lg md:text-xl">
                          {item.data.year}
                        </span>
                      </AnimatedText>
                    )}
                  </div>
                  <AnimatedText className="font-normal text-[14px] mt-4 px-1 z-10" delay={0.4}>
                    <PrismicRichText field={item.data.main_description} />
                  </AnimatedText>
                </div>
              </PrismicNextLink>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default WorkListing;
