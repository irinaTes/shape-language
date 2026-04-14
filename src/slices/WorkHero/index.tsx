"use client";
import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { motion } from "framer-motion";

/**
 * Props for `WorkHero`.
 */
export type WorkHeroProps = SliceComponentProps<Content.WorkHeroSlice>;

/**
 * Component for "WorkHero" Slices.
 */
const WorkHero: FC<WorkHeroProps> = ({ slice }) => {
  const { background_image, title, description } = slice.primary
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full -mt-[128px] relative h-[100vh] lg:h-[80vh] overflow-hidden flex flex-col justify-center items-center text-white px-4 md:px-10"
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
        className="relative z-10 flex flex-col items-center"
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
            className="text-center max-w-4xl"
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
            className="text-lg md:text-xl text-center max-w-7xl"
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
    </section>
  );
};

export default WorkHero;
