import type { Route } from "./+types/embed-current";
import { fetchCurrentAuction, parseTheme } from "../lib/api";
import { AuctionView } from "../components/AuctionView";

export function meta() {
  return [{ title: "Auction" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  return { state: await fetchCurrentAuction(), theme: parseTheme(request.url) };
}

export default function EmbedCurrent({ loaderData }: Route.ComponentProps) {
  return <AuctionView initialState={loaderData.state} theme={loaderData.theme} embedded />;
}
