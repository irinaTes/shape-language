'use client';
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import VectoryAnimation from "@/slices/HomeHero/VectoryAnimation";

/**
 * Props for `HomeHero`.
 */
export type HomeHeroProps = SliceComponentProps<Content.HomeHeroSlice>;

/**
 * Component for "HomeHero" Slices.
 */

const HomeHero: FC<HomeHeroProps> = ({ slice }) => {

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full px-4 lg:px-20"
    >
      <div className="p-4 lg:p-10 border border-gray-500  rounded-2xl h-fit max-h-[700px]">
        <VectoryAnimation  />
      </div>
      {/* <p>
        Fiecare proiect va avea Denumire, fotografie, descriere, video, aestetic section cu galerie de fotografii, process cu imagini si video din proces.
      </p>
      <p>
        proiectele le aranjam - vezi project-example.jpg
      </p> */}
    </section>
  );
};

export default HomeHero;
