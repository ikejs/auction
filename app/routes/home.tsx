import type { Route } from "./+types/home";
import { fetchCurrentAuction, parseTheme } from "../lib/api";
import { AuctionView } from "../components/AuctionView";

export function meta({ data }: Route.MetaArgs) {
  const title = data?.state?.auction?.title || "Charity Auction";
  return [
    { title },
    { name: "description", content: data?.state?.auction?.description || "Live charity auction." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return { state: await fetchCurrentAuction(), theme: parseTheme(request.url) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <AuctionView initialState={loaderData.state} theme={loaderData.theme} />;
}
