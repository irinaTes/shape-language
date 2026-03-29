"use client";
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { motion } from "framer-motion";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

/**
 * Props for `ZigZagContent`.
 */
export type ZigZagContentProps =
  SliceComponentProps<Content.ZigZagContentSlice>;

/**
 * Component for "ZigZagContent" Slices.
 */
const ZigZagContent: FC<ZigZagContentProps> = ({ slice }) => {
  const {
    section_title,
    section_description,
    background_color_primary,
    text_color_primary,
    background_color_secondary,
    text_color_secondary,
    content,
  } = slice.primary;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full py-20 md:py-32 "
      style={{ backgroundColor: background_color_primary || undefined }}
    >
      {/* First item: Title and Description with primary colors */}
      {/* {(section_title || section_description) && (
        <motion.div
          className="relative mb-32 md:mb-36 lg:mb-48"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          <div
            className="py-12 md:py-20 lg:py-28 px-8 md:px-20 lg:px-32 rounded-r-full"
            style={{
              backgroundColor: background_color_primary || "#000",
              color: text_color_primary || "#fff",
            }}
          >
            <div className="max-w-7xl">
              {section_title && (
                <motion.h2
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.6, 0.05, 0.01, 0.9],
                  }}
                >
                  {section_title}
                </motion.h2>
              )}
              {section_description && (
                <motion.div
                  className="text-xl md:text-2xl lg:text-3xl leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                    ease: [0.6, 0.05, 0.01, 0.9],
                  }}
                >
                  <PrismicRichText field={section_description} />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )} */}

      {/* Content items - alternating sides, starting with secondary colors */}
      {content.map((item, index) => {
        const isEven = index % 2 === 0;
        const backgroundColor = isEven
          ? background_color_secondary
          : background_color_primary;
        const textColor = isEven
          ? text_color_secondary
          : text_color_primary;

        return (
          <motion.div
            key={index}
            className={`relative mb-32 md:mb-48 lg:mb-64 ${isEven ? "ml-auto" : ""}`}
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.6, 0.05, 0.01, 0.9],
            }}
          >
            <div
              className={`py-20 lg:py-28 px-8 md:px-16 lg:px-24 ${
                isEven ? "rounded-none lg:rounded-l-full" : "rounded-r-full"
              }`}
              style={{
                backgroundColor: backgroundColor || "#000",
                color: textColor || "#fff",
              }}
            >
              <div className="w-full">
                <div className={`flex flex-col w-full items-center gap-16 md:gap-10 lg:gap-20 xl:gap-40 ${
                  isEven ? "lg:flex-row-reverse  justify-between" : "lg:flex-row  justify-between"
                }`}>
                  {/* Before/After Image Slider */}
                  {item.before_image?.url && item.after_image?.url && (
                    <motion.div
                      className="relative flex-shrink-0 w-full lg:w-[55%]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        ease: [0.6, 0.05, 0.01, 0.9],
                      }}
                    >
                      <BeforeAfterSlider
                        beforeImage={item.before_image}
                        afterImage={item.after_image}
                      />
                    </motion.div>
                  )}

                  {/* Text content */}
                  {item.text && (
                    <motion.div
                      className="flex-1 max-w-4xl text-xl  lg:text-xl xl:text-2xl leading-relaxed"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5,
                        ease: [0.6, 0.05, 0.01, 0.9],
                      }}
                    >
                      <PrismicRichText field={item.text} />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
};

export default ZigZagContent;
