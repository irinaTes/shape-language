"use client";

import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";

const WORDS = [
  // Core 3D / CG Words
  "Render",
  "Rendering",
  "3D",
  "CGI",
  "Real-Time",
  "Raytracing",
  "Lighting",
  "Shadows",
  "Textures",
  "Materials",
  "Shaders",
  "Geometry",
  "Polygons",
  "Mesh",
  "Normals",
  "UV",
  "Mapping",
  "Depth",
  "Volume",
  "Perspective",
  // Assets & Creation
  "Models",
  "Characters",
  "Environments",
  "Worlds",
  "Assets",
  "Props",
  "Scenes",
  "Composition",
  "Animation",
  "Rigging",
  "Motion",
  "Simulation",
  // Creative / Studio Language
  "Visuals",
  "Craft",
  "Detail",
  "Precision",
  "Aesthetic",
  "Atmosphere",
  "Emotion",
  "Narrative",
  "Story",
  "Concept",
  "Direction",
  "Design",
  // Abstract / High-End Studio Feel
  "Presence",
  "Form",
  "Matter",
  "Space",
  "Scale",
  "Flow",
  "Energy",
  "Balance",
  "Contrast",
  "Silence",
  "Rhythm",
];

// Light neutral palette for dark backgrounds, with occasional accent
const COLORS = [
  "#ffffff", // white
  "#f5f5f5", // off-white
  "#e5e5e5", // light gray
  "#d4d4d4", // gray
  "#fafafa", // near white
  "#f0f0f0", // very light gray
  "#ebebeb", // light gray
  "#e0e0e0", // soft gray
  "#d9d9d9", // medium light gray
  "#EF4444", // accent red
  "#F87171", // accent light red
  "#DC2626", // accent deep red
];

interface WordConfig {
  word: string;
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  rotation: number;
  isOutlined: boolean;
  color: string;
  animationDuration: number;
  animationDelay: number;
  zIndex: number;
}

function generateWords(count: number): WordConfig[] {
  const words: WordConfig[] = [];

  for (let i = 0; i < count; i++) {
    const wordIndex = Math.floor(Math.random() * WORDS.length);
    const word = WORDS[wordIndex];

    // Bias towards neutral colors, occasionally use red accent
    const colorRandom = Math.random();
    let colorIndex: number;
    if (colorRandom > 0.92) {
      // 8% chance of red accent color
      colorIndex = 9 + Math.floor(Math.random() * 3);
    } else {
      colorIndex = Math.floor(Math.random() * 9);
    }

    // More chance for large and extra large text
    const sizeRandom = Math.random();
    let fontSize: number;
    if (sizeRandom > 0.7) {
      fontSize = 200 + Math.random() * 150; // 200px to 350px (extra large) - 30%
    } else if (sizeRandom > 0.35) {
      fontSize = 100 + Math.random() * 100; // 100px to 200px (large) - 35%
    } else {
      fontSize = 12 + Math.random() * 88; // 12px to 100px (small to medium) - 35%
    }

    words.push({
      word,
      x: Math.random() * 100,
      y: Math.random() * 100,
      fontSize,
      opacity: 0.02 + Math.random() * 0.06, // 0.02 to 0.08
      rotation: (Math.random() - 0.5) * 8, // -4deg to 4deg (subtle)
      isOutlined: Math.random() > 0.3, // 70% outlined
      color: COLORS[colorIndex],
      zIndex: 0, // all words same layer, container handles stacking
      animationDuration: 3 + Math.random() * 5, // 3s to 8s per cycle
      animationDelay: Math.random() * 4, // 0s to 4s stagger
    });
  }

  return words;
}

interface GenerativeTypographyBackgroundProps {
  wordCount?: number;
  className?: string;
}

const GenerativeTypographyBackground: FC<GenerativeTypographyBackgroundProps> = ({
  wordCount = 60,
  className = "",
}) => {
  const [words, setWords] = useState<WordConfig[]>([]);

  useEffect(() => {
    setWords(generateWords(wordCount));
  }, [wordCount]);

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {words.map((config, index) => (
        <motion.span
          key={index}
          className="absolute whitespace-nowrap font-sans uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, config.opacity, config.opacity, 0] }}
          transition={{
            duration: config.animationDuration,
            delay: config.animationDelay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.8, 1],
          }}
          style={{
            left: `${config.x}%`,
            top: `${config.y}%`,
            fontSize: `${config.fontSize}px`,
            transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
            color: config.isOutlined ? "transparent" : config.color,
            WebkitTextStroke: config.isOutlined
              ? `1px ${config.color}`
              : "none",
            fontWeight: config.isOutlined ? 600 : 500,
            letterSpacing: "0.05em",
          }}
        >
          {config.word}
        </motion.span>
      ))}
    </div>
  );
};

export default GenerativeTypographyBackground;
