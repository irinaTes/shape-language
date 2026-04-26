"use client";

import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  index: number;
}

interface AnimatedChildProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

// Shared variants used by all children inside the card
const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Card wrapper — animates in first, children stagger after
export function AnimatedCard({ children, className, index }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 1.0,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedImage({ children, className }: Omit<AnimatedCardProps, 'index'>) {
  return (
    <motion.div
      className={`relative ${className ?? ''}`}
      variants={childVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ children, className, delay = 0 }: AnimatedChildProps) {
  return (
    <motion.div
      className={className}
      variants={childVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: 0.35 + delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

