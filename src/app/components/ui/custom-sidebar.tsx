"use client";

import { cn } from "@/app/utils/utils";
import * as React from "react";
import { useEffect } from "react";

interface CustomSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  logo?: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function CustomSidebar({ isOpen, onOpenChange, children, logo, headerContent }: CustomSidebarProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onOpenChange]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 h-screen w-full bg-white shadow-xl",
          " transform-gpu will-change-transform will-change-opacity",
          "transition-all duration-500",
          isOpen
            ? " -translate-y-0 ease-in"
            : " -translate-y-full  ease-out pointer-events-none delay-150"
        )}
      >

        <nav className={cn(
          "px-4 py-6 space-y-4 overflow-y-auto h-[calc(100vh-5rem)] mt-40",
          "transform-all duration-500 ",
          isOpen
            ? " -translate-x-0 ease-in delay-150"
            : " -translate-x-full ease-out pointer-events-none"
        )}>
          {children}
        </nav>
      </div>
    </>
  );
}