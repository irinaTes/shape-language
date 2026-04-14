"use client";
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { motion } from "framer-motion";

/**
 * Props for `Galery`.
 */
export type GaleryProps = SliceComponentProps<Content.GalerySlice>;

/**
 * Component for "Galery" Slices.
 */
const Galery: FC<GaleryProps> = ({ slice }) => {
  const { image1, image2, image3, image4, image5, image6, image7, image8, background_color } = slice.primary;

  const images = [
    { field: image1, className: "col-span-1 row-span-1 md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-2" }, // Tall on medium, large square on desktop
    { field: image2, className: "col-span-1 row-span-2 md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1" }, // Tall on mobile, wide on medium, regular on desktop
    { field: image3, className: "col-span-2 row-span-1 md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-2" }, // Wide on mobile, regular on medium, tall on desktop
    { field: image4, className: "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1 lg:row-span-2" }, // Regular on mobile, large square on medium, wide on desktop
    { field: image5, className: "col-span-1 row-span-2 md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1" }, // Tall on mobile, regular on others
    { field: image6, className: "col-span-2 row-span-2 md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-2" }, // Large square on mobile, tall on medium, wide on desktop
    { field: image7, className: "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1" }, // Regular on mobile, wide on medium, tall on desktop
    { field: image8, className: "col-span-2 row-span-1 md:col-span-1 md:row-span-1 lg:col-span-2 lg:row-span-1" }, // Wide on mobile, regular on medium, wide on desktop
  ];

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-4 md:px-10 lg:px-20  py-24 lg:py-64"
      style={{ backgroundColor: background_color || undefined }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-20 lg:gap-40 auto-rows-[200px] md:auto-rows-[250px] lg:auto-rows-[300px]">
        {images.map((item, index) => (
          item.field?.url && (
            <motion.div
              key={index}
              className={`relative ${item.className}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.6, 0.05, 0.01, 0.9]
              }}
            >
              <motion.div
                className="relative w-full h-full overflow-hidden rounded-lg glow-card"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <PrismicNextImage
                  field={item.field}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={index === 0}
                />
              </motion.div>
            </motion.div>
          )
        ))}
      </div>
    </section>
  );
};

export default Galery;
