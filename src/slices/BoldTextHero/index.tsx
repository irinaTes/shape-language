"use client";

import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { motion } from "framer-motion";

/**
 * Props for `BoldTextHero`.
 */
export type BoldTextHeroProps = SliceComponentProps<Content.BoldTextHeroSlice>;

/**
 * Component for "BoldTextHero" Slices.
 */
const BoldTextHero: FC<BoldTextHeroProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full px-4 lg:px-20"
    >
      <h1 className="flex flex-col gap-0">
        <motion.span
          className="text-[80px] lg:text-[150px] xl:text-[350px] font-black leading-64 text-transparent"
          style={{ WebkitTextStroke: "2px white", willChange: 'transform, opacity' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {slice.primary.text}
        </motion.span>
        <motion.span
          className="text-[80px] lg:text-[150px] xl:text-[350px] text-right leading-64 font-black text-white"
          style={{ willChange: 'transform, opacity' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          {slice.primary.secondary_text}
        </motion.span>
      </h1>
    </section>
  );
};

export default BoldTextHero;
