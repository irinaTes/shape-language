"use client";
import { useState, useRef, useEffect } from "react";
import { HeaderDocument } from "../../../../prismicio-types";
import { PrismicLink } from "@prismicio/react";
import { CustomSidebar } from "../ui/custom-sidebar";
import { isFilled } from "@prismicio/client";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/app/utils/utils";

// Helper function to calculate luminance and determine if we need dark or light text
const getContrastColor = (bgColor: string): 'light' | 'dark' => {
    // If no color provided, default to light text
    if (!bgColor) return 'light';

    // Remove # if present
    const hex = bgColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return 'dark' for light backgrounds, 'light' for dark backgrounds
    return luminance > 0.5 ? 'dark' : 'light';
};

export default function Header({ data }: { data: HeaderDocument }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [textColor, setTextColor] = useState<'light' | 'dark'>('light');
    const { navigation_items, logo_animation, logo_white, logo_filled } = data.data;
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const detectBackgroundColor = () => {
            // Get all section elements
            const sections = document.querySelectorAll('section');
            const headerRect = document.querySelector('header')?.getBoundingClientRect();

            if (!headerRect) return;

            // Find which section is currently behind the header
            let currentSection: Element | null = null;
            sections.forEach((section) => {
                const sectionRect = section.getBoundingClientRect();
                // Check if section overlaps with header
                if (sectionRect.top <= headerRect.bottom && sectionRect.bottom >= headerRect.top) {
                    currentSection = section;
                }
            });

            if (currentSection) {
                // Get computed background color
                const bgColor = window.getComputedStyle(currentSection).backgroundColor;

                // Convert rgb to hex
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const hex = '#' + rgb.map(x => {
                        const hexValue = parseInt(x).toString(16);
                        return hexValue.length === 1 ? '0' + hexValue : hexValue;
                    }).join('');

                    setTextColor(getContrastColor(hex));
                }
            }
        };

        // Detect on scroll
        window.addEventListener('scroll', detectBackgroundColor);
        // Detect initially
        detectBackgroundColor();

        return () => window.removeEventListener('scroll', detectBackgroundColor);
    }, []);

    const handleVideoHover = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    // const handleVideoLeave = () => {
    //     if (videoRef.current) {
    //         videoRef.current.pause();
    //         videoRef.current.currentTime = 0;
    //     }
    // };

    // Use the appropriate logo based on contrast
    const logoToUse = textColor === 'dark' ? logo_filled : logo_white;

    const logoElement = isFilled.linkToMedia(logo_animation) ? (
        <video
            ref={videoRef}
            className="h-16 w-auto cursor-pointer"
            muted
            playsInline
            onMouseEnter={handleVideoHover}
            // onMouseLeave={handleVideoLeave}
            src={logo_animation.url}
        />
    ) : (
        <PrismicNextImage field={logoToUse} className="h-16 w-auto" />
    )

    const mobileLogo = isFilled.linkToMedia(logo_animation) ? (
        <video
            className="h-16 w-auto"
            muted
            playsInline
            src={logo_animation.url}
        />
    ) : (
        <PrismicNextImage field={logo_filled} className="h-16 w-auto" />
    )

    return (
        <header className="sticky inset-x-0 top-0 z-50 shadow-sm slide-in-top ">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between ">
                    {/* Logo */}

                    <Link href="/" className="relative inline-block z-[60]">
                        {/* match the logo height (was h-8) */}
                        <span className="relative block h-20 w-36">
                            {/* Mobile logo */}
                            <span
                                className={cn(
                                    "absolute inset-0 grid place-items-center transition-opacity duration-300 ease-in-out [will-change:opacity]",
                                    mobileMenuOpen ? "opacity-100" : " delay-300 opacity-0 pointer-events-none"
                                )}
                            >
                                {/* keep inner content within the box */}
                                <span className="flex items-center justify-center h-full w-auto ">{mobileLogo}</span>
                            </span>

                            {/* Default logo */}
                            <span
                                className={cn(
                                    "absolute inset-0 grid place-items-center transition-opacity duration-300 ease-in-out [will-change:opacity]",
                                    mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100 delay-300"
                                )}
                            >
                                <span className="block h-full w-auto">{logoElement}</span>
                            </span>
                        </span>
                    </Link>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation_items.map((item, index) => (
                            <PrismicLink
                                key={index}
                                field={item.item_link}
                                className={cn(
                                    "hover:opacity-45 px-3 py-2 text-lg font-medium transition-all duration-300 uppercase",
                                    textColor === 'dark' ? 'text-black' : 'text-white'
                                )}
                            >
                                {item.item_text}
                            </PrismicLink>
                        ))}
                    </nav>

                    {/* Mobile menu */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="inline-flex border-0 items-center justify-center p-2 rounded-md focus:outline-none cursor-pointer active:border-0 relative z-100"
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <div className="flex flex-col gap-3">
                                <div className={`flex transition-all duration-200  row gap-1 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : 'transform-none'}`}>
                                    <div className={`w-3 h-1 rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                    <div className={`w-8 h-1 rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                </div>

                                <div className={`w-12 h-1 rounded-lg origin-center transition-all duration-200  ${mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-primary' : textColor === 'dark' ? 'transform-none bg-black' : 'transform-none bg-white'}`}></div>

                                <div className={`flex  row gap-1 transition-all duration-200  ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className={`w-8 h-1 rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                    <div className={`w-3 h-1 rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                </div>
                            </div>
                        </button>

                        <CustomSidebar
                            isOpen={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            {navigation_items.map((item, index) => (
                                <PrismicLink
                                    key={index}
                                    field={item.item_link}
                                    className="block text-gray-900 hover:text-gray-600 px-3 py-2 text-base font-medium border-l-4 border-transparent hover:border-indigo-500 transition-colors"
                                >
                                    {item.item_text}
                                </PrismicLink>
                            ))}
                        </CustomSidebar>
                    </div>
                </div>
            </div >
        </header >
    );
}
