import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

// Public bidding UI, SSR'd on Vercel. Initial auction state comes from the
// DigitalOcean REST API in each route loader; live updates arrive over socket.io.
export default {
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
