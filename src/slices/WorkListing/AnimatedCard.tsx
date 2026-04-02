"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  index: number
}

export function AnimatedImage({ children, index, className }: AnimatedCardProps) {
  return (
    <motion.div
      key={index}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.6, 0.05, 0.01, 0.9]
      }}
    >
      <motion.div
        className="relative w-full h-full overflow-hidden rounded-lg"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.15 }}
        transition={{
          duration: 1,
          ease: "easeOut",
          scale: {
            type: "tween",
            duration: 4,
            ease: "linear"
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function AnimatedText({ children, className, delay = 0 }: AnimatedTextProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={textVariants}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

