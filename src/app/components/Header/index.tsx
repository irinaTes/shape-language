"use client";
import { useState, useRef } from "react";
import { HeaderDocument } from "../../../../prismicio-types";
import { PrismicLink } from "@prismicio/react";
import { CustomSidebar } from "../ui/custom-sidebar";
import { isFilled } from "@prismicio/client";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { cn } from "@/app/utils/utils";

export default function Header({ data }: { data: HeaderDocument }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { navigation_items, logo_animation, logo_white, logo_filled } = data.data;
    const videoRef = useRef<HTMLVideoElement>(null);

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
        <PrismicNextImage field={logo_white} className="h-16 w-auto" />
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
                                className=" hover:opacity-45 px-3 py-2 text-lg font-medium transition-opacity duration-200 uppercase"
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
                                    <div className={`w-3 h-1 rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : 'bg-white'}`}></div>
                                    <div className={`w-8 h-1 rounded-lg transition-all duration-200 ${mobileMenuOpen ? 'bg-primary' : 'bg-white'}`}></div>
                                </div>

                                <div className={`w-12 h-1 rounded-lg origin-center transition-all duration-200  ${mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-primary' : 'transform-none bg-white'}`}></div>

                                <div className={`flex  row gap-1 transition-all duration-200  ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className={`w-8 h-1 rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : 'bg-white'}`}></div>
                                    <div className={`w-3 h-1 rounded-lg transition-all ${mobileMenuOpen ? 'bg-primary' : 'bg-white'}`}></div>
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
