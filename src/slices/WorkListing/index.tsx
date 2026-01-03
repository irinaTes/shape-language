'use client';
import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { cn } from "@/app/utils/utils";
import { motion } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
import "@/app/assets/css/video-controls.css";
import { VimeoUrl } from "@vimeo/player";
/**
 * Props for `WorkListing`.
 */
export type WorkListingProps = SliceComponentProps<Content.WorkListingSlice>;

/**
 * Component for "WorkListing" Slices.
 */
const WorkListing: FC<WorkListingProps> = ({ slice }) => {
  const { color_1, color_2, color_3, color_4, focus_image, year_label, isleft, video_url, second_focus_image, title, description, link_to_project_page } = slice.primary

  // Filter only filled colors
  const filledColors = [color_1, color_2, color_3, color_4].filter(color => isFilled.keyText(color));

  // Calculate width class based on number of filled colors
  const getWidthClass = (count: number) => {
    switch (count) {
      case 1: return 'w-full';
      case 2: return 'w-1/2';
      case 3: return 'w-1/3';
      case 4: return 'w-1/4';
      default: return 'w-1/4';
    }
  };

  return (
    <>
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="w-full flex flex-col gap-10 md:gap-16 py-24 md:py-56"
      >
        {isFilled.image(focus_image) &&
          <motion.div
            className="relative cursor-pointer"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          // onClick={handleClick}
          >

            <motion.div
              className={cn("absolute text-4xl md:text-7xl -mt-6 md:-mt-10 left-4 md:left-10")}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {year_label} {title}
            </motion.div>
            <PrismicNextLink field={link_to_project_page} className="w-full h-full">
              <PrismicNextImage field={focus_image} className="w-full h-[40rem] object-cover" />
            </PrismicNextLink>
          </motion.div>
        }

        <div className={cn("w-full flex justify-end px-4 md:px-10", isleft && "justify-start")}>
          <motion.div
            className={cn("w-full lg:w-3/4 flex gap-10 md:gap-16", isleft ? "flex-col md:flex-row" : "flex-col-reverse md:flex-row-reverse")}
            initial={{ opacity: 0, x: isleft ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            <motion.div
              className="w-full md:w-2/3 h-auto cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isFilled.keyText(video_url) && <PrismicNextLink field={link_to_project_page} className="w-full h-full">

                <VideoPlayer
                  vimeoUrl={video_url as VimeoUrl}
                  className="w-full h-full"
                  controls={false}
                />
              </PrismicNextLink>}

            </motion.div>
            <div className="w-full md:w-1/3 flex flex-col gap-4 cursor-pointer" >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >

                {isFilled.image(second_focus_image) && <PrismicNextLink field={link_to_project_page} className="w-full h-full">
                  <PrismicNextImage field={second_focus_image} />
                </PrismicNextLink>}

              </motion.div>

              {filledColors.length > 0 && (
                <div className="flex flex-row w-full gap-4">
                  {filledColors.map((color, index) => (
                    <motion.div
                      key={index}
                      className={cn("h-10 opacity-25 rounded-full", getWidthClass(filledColors.length))}
                      style={{ backgroundColor: color || undefined }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 0.25, scale: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    />
                  ))}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >

                <PrismicNextLink field={link_to_project_page} className="w-full h-full">
                  <h2 className="text-3xl">{title}</h2>
                  <p>{description}</p>
                </PrismicNextLink>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </section>
    </>
  );
};

export default WorkListing;
