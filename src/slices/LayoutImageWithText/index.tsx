'use client'
import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { motion } from "framer-motion";
import { cn } from "@/app/utils/utils";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `LayoutImageWithText`.
 */
export type LayoutImageWithTextProps =
  SliceComponentProps<Content.LayoutImageWithTextSlice>;

/**
 * Component for "LayoutImageWithText" Slices.
 */
const LayoutImageWithText: FC<LayoutImageWithTextProps> = ({ slice }) => {
  const { description, big_image, small_image, background_color, text_color, reverse_layout } = slice.primary

  return (
    <>
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="w-full flex flex-col gap-10 lg:gap-16 py-24 lg:py-64"
        style={{ backgroundColor: background_color || "transparent", color: text_color || "white" }}
      >

        <div className={cn("w-full flex justify-end px-4 md:px-10", reverse_layout && "justify-start")}>
          <motion.div
            className={cn("w-full flex gap-10 lg:gap-16", reverse_layout ? "flex-col lg:flex-row" : "flex-col-reverse lg:flex-row-reverse items-end")}
            initial={{ opacity: 0, x: reverse_layout ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            <motion.div
              className="w-full md:w-11/12 h-auto cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >


              <PrismicNextImage field={big_image} />

            </motion.div>
            <div className="w-full flex flex-col gap-20 cursor-pointer" >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="md:w-2/4 "
              >

                <PrismicNextImage field={small_image} />

              </motion.div>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full md:max-w-4xl"
              >
                <PrismicRichText field={description} />
              </motion.div>
            </div>
          </motion.div>
        </div>

      </section>
    </>
  );
};

export default LayoutImageWithText;
