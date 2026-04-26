"use client";

import { FooterDocument, HeaderDocument } from "../../../../prismicio-types";
import { PrismicLink } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { isFilled } from "@prismicio/client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Footer({ data, headerData }: { data: FooterDocument, headerData: HeaderDocument }) {
    const { social_links, phone_number, email, address, copyright_text } = data.data;
    const { navigation_items, logo_animation, logo_white } = headerData.data;
    const footerRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Use Framer Motion's useScroll to track when footer enters viewport
    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"]
    });


    const handleVideoHover = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

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
        <PrismicNextImage field={logo_white} className="h-10 w-auto" />
    )


    // Transform scroll progress to translateY
    // Scroll down (progress increases 0→1) → y goes from 200 to 0 (footer slides up from below)
    // Scroll up (progress decreases 1→0) → y goes from 0 to 200 (footer slides back down under content)
    const y = useTransform(scrollYProgress, [0, 1], [-200, 0]);

    // Animate shadow intensity and spread based on scroll
    // When footer is hidden (scrollYProgress = 0, y = -200): shadow is MORE intense and grows taller
    // When footer is visible (scrollYProgress = 1, y = 0): shadow is still visible but less intense
    const shadowHeight = useTransform(scrollYProgress, [0, 1], [800, 50]);
    const shadowOpacity = useTransform(scrollYProgress, [0, 1], [0.95, 0.3]);
    const shadowBackground = useTransform(
        shadowOpacity,
        (opacity) => `linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}) 0%, transparent 100%)`
    );

    return (
        <motion.footer
            ref={footerRef}
            style={{ y, willChange: 'transform' }}
            className="relative text-white py-12 md:py-24 px-4 sm:px-6 lg:px-8 w-full"
        >
            {/* Shadow overlay above content */}
            <motion.div
                className="absolute inset-x-0 top-0 pointer-events-none z-20"
                style={{
                    height: shadowHeight,
                    background: shadowBackground,
                    willChange: 'height',
                }}
            />

            <div className="relative z-10 flex flex-col md:flex-row gap-4 md:justify-between w-full">

                <div></div>

                <div className="flex flex-col gap-8 mb-8 items-end text-end">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Contact</h3>

                        {isFilled.keyText(phone_number) && (
                            <p className="mb-3">
                                <span className="opacity-75">Phone: </span>
                                {phone_number}
                            </p>
                        )}

                        {isFilled.link(email) && (
                            <p className="mb-3">
                                <span className="opacity-75">Email: </span>
                                <PrismicLink
                                    field={email}
                                    className="hover:underline"
                                >
                                    {email.url?.replace('mailto:', '')}
                                </PrismicLink>
                            </p>
                        )}

                        {isFilled.keyText(address) && (
                            <p className="mb-3">
                                <span className="opacity-75">Address: </span>
                                {address}
                            </p>
                        )}
                    </div>

                    {/* Social Links */}
                    {social_links.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                            <div className="flex gap-4">
                                {social_links.map((item, index) => (
                                    isFilled.link(item.social_link) && (
                                        <PrismicLink
                                            key={index}
                                            field={item.social_link}
                                            className="hover:opacity-75 transition-opacity"
                                        >
                                            {isFilled.image(item.social_image) ? (
                                                <PrismicNextImage
                                                    field={item.social_image}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            ) : (
                                                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </PrismicLink>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col w-full items-center justify-center gap-6">
                    {logoElement}
                <div className="w-full flex flex-col gap-4 md:flex-row justify-center">
                    {navigation_items.map((item, index) => (
                        <PrismicLink
                            key={index}
                            field={item.item_link}
                            className="nav-link px-3 py-2 text-lg font-medium transition-all duration-300 uppercase text-white [font-family:var(--font-space-mono)]"
                        >
                            {item.item_text}
                        </PrismicLink>
                    ))}
                </div>
            </div>

            {/* Copyright */}
            {isFilled.keyText(copyright_text) && (
                <div className="border-t glow-divider pt-8">
                    <p className="text-sm opacity-75 text-center">
                        {copyright_text}
                    </p>
                </div>
            )}
        </motion.footer>
    );
}
