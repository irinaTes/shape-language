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
      {/* Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: background_color || "transparent", willChange: 'opacity' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      />

      {/* Animated video player */}
      <motion.div
        style={{ willChange: 'transform, opacity' }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="border border-gray-500 rounded-2xl p-4 md:p-10"
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
