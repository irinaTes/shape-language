"use client";
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { VimeoUrl } from "@vimeo/player";
import VideoPlayer from "@/components/VideoPlayer";
import { motion } from "framer-motion";

/**
 * Props for `Video`.
 */
export type VideoProps = SliceComponentProps<Content.VideoSlice>;

/**
 * Component for "Video" Slices.
 */
const Video: FC<VideoProps> = ({ slice }) => {
  const { video_url, background_color } = slice.primary
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-4 lg:px-20 py-20 lg:py-48 relative overflow-hidden"
    >
      {/* Animated background with scale effect */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: background_color || "transparent" }}
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: 1,
          ease: [0.6, 0.05, 0.01, 0.9]
        }}
      />

      {/* Animated video player */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.6, 0.05, 0.01, 0.9]
        }}
        className="border border-gray-500  rounded-2xl p-4 md:p-10 "
      >
        <VideoPlayer
          vimeoUrl={video_url as VimeoUrl}
          className="w-full h-full rounded-2xl"
        />
      </motion.div>
    </section>
  );
};

export default Video;
