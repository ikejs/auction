import type { Route } from "./+types/embed-slug";
import { fetchAuction, parseTheme } from "../lib/api";
import { AuctionView } from "../components/AuctionView";

export function meta() {
  return [{ title: "Auction" }, { name: "robots", content: "noindex" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return { state: await fetchAuction(params.slug), theme: parseTheme(request.url) };
}

export default function EmbedSlug({ loaderData, params }: Route.ComponentProps) {
  return (
    <AuctionView
      initialState={loaderData.state}
      slug={params.slug}
      theme={loaderData.theme}
      embedded
    />
  );
}
