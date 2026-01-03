"use client";

import { FC, useRef, useState, useCallback, useEffect } from "react";
import { ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: ImageField;
  afterImage: ImageField;
  className?: string;
}

const BeforeAfterSlider: FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX);
    },
    [isDragging, updateSliderPosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      updateSliderPosition(e.touches[0].clientX);
    },
    [isDragging, updateSliderPosition]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on container to move slider
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      updateSliderPosition(e.clientX);
    },
    [updateSliderPosition]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  if (!beforeImage?.url || !afterImage?.url) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl select-none ${className}`}
      onClick={handleContainerClick}
    >
      {/* After Image (Bottom layer - fully visible) */}
      <div className="absolute inset-0">
        <PrismicNextImage
          field={afterImage}
          className="object-cover"
          fill
          draggable={false}
        />
      </div>

      {/* Before Image (Top layer - clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <PrismicNextImage
          field={beforeImage}
          className="object-cover"
          fill
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        {/* Vertical Line */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white shadow-lg -translate-x-1/2" />

        {/* Circular Handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <GripVertical className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </div>
      </div>

      {/* Overlay to capture drag events when dragging */}
      {isDragging && (
        <div className="absolute inset-0 z-20 cursor-ew-resize" />
      )}
    </div>
  );
};

export default BeforeAfterSlider;
