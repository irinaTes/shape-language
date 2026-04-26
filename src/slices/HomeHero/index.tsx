'use client';
import { FC, useEffect, useRef, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import dynamic from "next/dynamic";
import MobileHero from "./MobileHero";
import { useLoadingContext } from "@/components/PageWithLoading";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export type HomeHeroProps = SliceComponentProps<Content.HomeHeroSlice>;

type ViewportMode = 'mobile' | 'tablet' | 'desktop';

function getViewportMode(w: number): ViewportMode {
  if (w >= 1024) return 'desktop';
  if (w >= 768) return 'tablet';
  return 'mobile';
}

const HomeHero: FC<HomeHeroProps> = ({ slice }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode | null>(null);
  const loadingContext = useLoadingContext();
  const hasRegistered = useRef(false);

  useEffect(() => {
    const update = () => setViewportMode(getViewportMode(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Pre-register the 3D scene from the parent (non-dynamic) component so the
  // registration happens before PageWithLoading's isInitialized fires.
  useEffect(() => {
    if (hasRegistered.current || !loadingContext) return;
    if (window.innerWidth >= 768) {
      loadingContext.register3DScene();
      hasRegistered.current = true;
    }
  }, [loadingContext]);

  if (viewportMode === 'mobile') {
    return (
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="relative w-full -mt-32"
      >
        <MobileHero />
      </section>
    );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full -mt-32"
    >
      <div className="h-screen w-full">
        {viewportMode !== null && <Scene3D viewportMode={viewportMode} />}
      </div>
    </section>
  );
};

export default HomeHero;
