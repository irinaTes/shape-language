import { type Metadata } from "next";

import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Home() {
  const client = createClient();
  const home = await client.getByUID("page", "home");

  // <SliceZone> renders the page's slices.
  return (
    <div className="min-h-screen">
      <SliceZone slices={home.data.slices} components={components} />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const home = await client.getByUID("page", "home");

  return {
    title: home.data.meta_title ?? undefined,
    description: home.data.meta_description ?? undefined,
    openGraph: {
      title: home.data.meta_title ?? undefined,
      description: home.data.meta_description ?? undefined,
      images: home.data.meta_image.url ? [{ url: home.data.meta_image.url }] : undefined,
    },
  };
}
