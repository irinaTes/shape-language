'use client';
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

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
      className="relative w-full -mt-32"
    >
      <div className="h-screen w-full">
        <Scene3D />
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
