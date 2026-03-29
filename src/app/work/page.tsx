import { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/prismicio";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

export const metadata: Metadata = {
  title: "Work",
  description: "Explore our portfolio of work",
};

export default async function WorkPage() {
  const client = createClient();

  const workItems = await client.getAllByType("work_content", {
    fetch: [
      "work_content.main_title",
      "work_content.main_image",
      "work_content.main_description",
      "work_content.main_video_url",
    ],
  });

  return (
    <main className="w-full py-24 md:py-56">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-medium mb-16">Work</h1>
        <ul className="flex flex-col gap-12">
          {workItems.map((item) => (
            <li key={item.id}>
              <PrismicNextLink document={item} className="block group">
                {item.data.main_image?.url && (
                  <div className="mb-4 overflow-hidden">
                    <PrismicNextImage
                      field={item.data.main_image}
                      className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <h2 className="text-2xl md:text-4xl font-medium group-hover:opacity-80 transition-opacity">
                  {item.data.main_title}
                </h2>
              </PrismicNextLink>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
