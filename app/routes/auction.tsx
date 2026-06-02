import type { Route } from "./+types/auction";
import { fetchAuction, parseTheme } from "../lib/api";
import { AuctionView } from "../components/AuctionView";

export function meta({ data }: Route.MetaArgs) {
  const title = data?.state?.auction?.title || "Auction";
  return [
    { title },
    { name: "description", content: data?.state?.auction?.description || "Live charity auction." },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return { state: await fetchAuction(params.slug), theme: parseTheme(request.url) };
}

export default function AuctionBySlug({ loaderData, params }: Route.ComponentProps) {
  return <AuctionView initialState={loaderData.state} slug={params.slug} theme={loaderData.theme} />;
}
