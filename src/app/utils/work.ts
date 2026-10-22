import type { Client, Content } from "@prismicio/client";

// Work content in display order: lowest "order" first. Items without an order
// come after, newest published first.
export async function getOrderedWorkItems(
  client: Client<Content.AllDocumentTypes>,
  fetch: string[] = []
): Promise<Content.WorkContentDocument[]> {
  const items = await client.getAllByType("work_content", {
    ...(fetch.length > 0 && { fetch: [...fetch, "work_content.order"] }),
    orderings: [{ field: "document.first_publication_date", direction: "desc" }],
  });

  // Stable sort, so equal (or missing) orders keep the newest-first order from the API
  return items.sort((a, b) => {
    const orderA = a.data.order ?? Infinity;
    const orderB = b.data.order ?? Infinity;
    return orderA === orderB ? 0 : orderA - orderB;
  });
}
