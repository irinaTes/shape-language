import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Inlined at build time so it also works in client components
const MEDIA_BASE_URL = process.env.PUBLIC_MEDIA_BASE_URL ?? "";

// Prismic video fields hold just the file name from the Cloudflare media bucket:
// "intro reel.mp4" → `${MEDIA_BASE_URL}/intro%20reel.mp4`. Full http(s) URLs pass through unchanged.
export function resolveVideoUrl(value: string): string {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const path = trimmed.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
    return `${MEDIA_BASE_URL.replace(/\/+$/, "")}/${path}`;
}
