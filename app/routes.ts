import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auctions/:slug", "routes/auction.tsx"),

  // Embeddable widget versions (framed via /embed.js on external sites).
  route("embed", "routes/embed-current.tsx"),
  route("embed/:slug", "routes/embed-slug.tsx"),
] satisfies RouteConfig;
