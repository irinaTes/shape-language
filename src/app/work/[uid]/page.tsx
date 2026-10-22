import { Metadata } from "next";
import { notFound } from "next/navigation";

import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { WorkHeroContext, WorkNavItem } from "@/slices/WorkHero";
import WorkPagination from "@/app/components/WorkPagination";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;
  const client = createClient();
  const [page, workItems] = await Promise.all([
    client.getByUID("work_content", uid).catch(() => notFound()),
    client.getAllByType("work_content", { fetch: ["work_content.main_title", "work_content.main_image"] }),
  ]);

  // Same order as the WorkListing slice, wrapping around at both ends
  const ordered = workItems.reverse();
  const index = ordered.findIndex((item) => item.uid === page.uid);
  const neighbor = (offset: number): WorkNavItem | undefined => {
    if (index === -1 || ordered.length < 2) return undefined;
    const item = ordered[(index + offset + ordered.length) % ordered.length];
    return { url: `/work/${item.uid}`, title: item.data.main_title ?? "", image: item.data.main_image };
  };
  const context: WorkHeroContext = { prev: neighbor(-1), next: neighbor(1) };

  return (
    <>
      <SliceZone slices={page.data.slices} components={components} context={context} />
      <WorkPagination prev={context.prev} next={context.next} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID("work_content", uid).catch(() => notFound());

  return {
    title: page.data.meta_title || page.data.main_title,
    description: page.data.meta_description,
    openGraph: {
      title: page.data.meta_title ?? undefined,
      images: [{ url: page.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("work_content");

  return pages.map((page) => ({ uid: page.uid }));
}
