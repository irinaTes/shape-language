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
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const { navigation_items, logo_animation, logo_white, logo_filled } = data.data;
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > 20);

            // Only hide/show after scrolling past a threshold
            if (currentScrollY > 100) {
                // Scrolling down - hide header
                if (currentScrollY > lastScrollY.current) {
                    setIsHidden(true);
                }
                // Scrolling up - show header
                else {
                    setIsHidden(false);
                }
            } else {
                // Always show header near the top
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Cache sections once — only re-query if DOM changes
        let sections: NodeListOf<Element> | null = null;
        let rafId: number | null = null;

        const detectBackgroundColor = () => {
            if (rafId !== null) return; // already scheduled, skip
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (!sections) sections = document.querySelectorAll('section');
                const headerEl = document.querySelector('header');
                if (!headerEl) return;
                const headerRect = headerEl.getBoundingClientRect();

                let currentSection: Element | null = null;
                sections.forEach((section) => {
                    const sectionRect = section.getBoundingClientRect();
                    if (sectionRect.top <= headerRect.bottom && sectionRect.bottom >= headerRect.top) {
                        currentSection = section;
                    }
                });

                if (currentSection) {
                    const bgColor = window.getComputedStyle(currentSection).backgroundColor;
                    const rgb = bgColor.match(/\d+/g);
                    if (rgb) {
                        const hex = '#' + rgb.map(x => {
                            const hexValue = parseInt(x).toString(16);
                            return hexValue.length === 1 ? '0' + hexValue : hexValue;
                        }).join('');
                        setTextColor(getContrastColor(hex));
                    }
                }
            });
        };

        window.addEventListener('scroll', detectBackgroundColor, { passive: true });
        detectBackgroundColor();

        return () => {
            window.removeEventListener('scroll', detectBackgroundColor);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
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
            className="h-10 w-auto cursor-pointer"
            muted
            playsInline
            onMouseEnter={handleVideoHover}
            // onMouseLeave={handleVideoLeave}
            src={logo_animation.url}
        />
    ) : (
        <PrismicNextImage field={logoToUse} className="h-10 w-auto" />
    )

    const mobileLogo = isFilled.linkToMedia(logo_animation) ? (
        <video
            className="h-10 w-auto"
            muted
            playsInline
            src={logo_animation.url}
        />
    ) : (
        <PrismicNextImage field={logo_filled} className="h-10 w-auto" />
    )

    return (
        <header className={cn(
            "sticky inset-x-0 top-0 z-50 slide-in-top transition-all duration-300",
            isScrolled
                ? "bg-white/.5 dark:bg-black/.5 backdrop-blur-md shadow-lg"
                : "bg-transparent",
            isHidden && !mobileMenuOpen
                ? "-translate-y-full"
                : "translate-y-0"
        )}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between ">
                    {/* Logo */}

                    <Link href="/" className="relative inline-block z-[60]">
                        {/* match the logo height (was h-8) */}
                        <div className="relative block h-20 w-36">
                            {/* Mobile logo */}
                            <div
                                className={cn(
                                    "absolute inset-0 grid place-items-center transition-opacity duration-300 ease-in-out [will-change:opacity]",
                                    mobileMenuOpen ? "opacity-100" : " delay-300 opacity-0 pointer-events-none"
                                )}
                            >
                                {/* keep inner content within the box */}
                                <div className="flex items-center justify-center h-full w-auto ">{mobileLogo}</div>
                            </div>

                            {/* Default logo */}
                            <div
                                className={cn(
                                    "absolute inset-0 grid place-items-center transition-opacity duration-300 ease-in-out [will-change:opacity]",
                                    mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100 delay-300"
                                )}
                            >
                                <div className="flex justify-center items-center h-full w-auto ">{logoElement}</div>
                            </div>
                        </div>
                    </Link>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation_items.map((item, index) => (
                            <PrismicLink
                                key={index}
                                field={item.item_link}
                                className={cn(
                                    "hover:opacity-45 px-3 py-2 text-sm font-medium transition-all duration-300 uppercase [font-family:var(--font-space-mono)]",
                                    textColor === 'dark' ? 'text-black' : 'text-white'
                                )}
                            >
                                {item.item_text}
                            </PrismicLink>
                        ))}
                    </nav>

                    {/* Mobile menu */}
                    <div className="md:hidden flex justify-center items-center">
                        <button
                            type="button"
                            className="inline-flex border-0 items-center justify-center p-2 rounded-md focus:outline-none cursor-pointer active:border-0 relative z-100"
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <div className="flex flex-col gap-2">
                                <div className={`flex transition-all duration-200 row gap-1 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : 'transform-none'}`}>
                                    <div className={`w-2 h-px rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                    <div className={`w-5 h-px rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                </div>

                                <div className={`w-8 h-px rounded-lg origin-center transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-0.5 bg-primary' : textColor === 'dark' ? 'transform-none bg-black' : 'transform-none bg-white'}`}></div>

                                <div className={`flex row gap-1 transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className={`w-5 h-px rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
                                    <div className={`w-2 h-px rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : textColor === 'dark' ? 'bg-black' : 'bg-white'}`}></div>
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
