# auction — public bidding UI (Vercel)

The public-facing auction site. A React Router v7 (framework mode) app deployed to
Vercel. It renders the current auction server-side from the DigitalOcean backend's REST
API, then keeps bids live over a socket.io connection to that same backend.

All data, bid logic, emails, admin, and uploads live in the backend (`../auction-api`,
on DigitalOcean). This app holds **no secrets and no database access** — it only needs the
backend's URL.

## How it works

```
app/
  routes/
    home.tsx          "/"               -> loader fetches the featured live auction (SSR)
    auction.tsx       "/auctions/:slug" -> loader fetches a specific auction (SSR)
  components/
    AuctionView.tsx   orchestrates socket state, the bidder modal, sound, errors
    ItemCard.tsx      image, current bid, bid input (UX-only validation), bid history
    Countdown.tsx     live countdown (client-only to avoid hydration drift)
    BidderModal.tsx   collects name/email/phone (stored in localStorage)
    RelativeTime.tsx  "3m ago" timestamps (client-only)
  lib/
    api.ts            REST fetch + image URL resolution (VITE_API_URL)
    useAuctionSocket  socket.io connection: join room, apply "state", place bids
    bidder.ts         identity persistence + client-side validation hints
    types.ts          shared public types
```

Bid amounts typed in the UI are checked only as hints — the backend re-validates every
bid authoritatively (amount rules, schedule, rate limits).

## Local development

```bash
nvm use 22                 # needs Node >= 20
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install
npm run dev                # http://localhost:5173
```

Run the backend (`../auction-api`) alongside it (`npm run dev` there on :4000) and seed it
(`npm run seed`) so there's a live auction to show.

## Environment

| var | purpose |
|-----|---------|
| `VITE_API_URL` | base URL of the DigitalOcean backend (REST + socket.io). e.g. `https://api.auction.ike.dev` |
| `VITE_PUBLIC_SITE_URL` | optional; this site's own URL, used in a few links |

## Embedding on another website

The public auction can be embedded on any external site with a two-line snippet. It's an
auto-resizing iframe (`embed.js` injects it and handles sizing), so the host page's styles
never clash and live bidding / sound / emails all keep working.

```html
<div class="rp-auction" data-slug="your-auction-slug" data-theme="dark"></div>
<script src="https://your-auction-site/embed.js" defer></script>
```

- Omit `data-slug` (or leave it empty) to always show the **current live** auction.
- `data-theme` is `dark` (default) or `light`.
- Multiple widgets per page are supported.
- When a visitor enters their bidder details, the iframe briefly expands to a full-viewport
  overlay so the form is centered, then collapses back — handled automatically.

Routes involved: `/embed` (current auction) and `/embed/:slug`, plus the static
`public/embed.js` loader. The admin panel (in `../auction-api`) shows a ready-to-paste
snippet per auction. See `public/embed-demo.html` for a working host-page example
(`/embed-demo.html`). For cross-site embedding the auction site must be frameable — don't
add an `X-Frame-Options: DENY` header (Vercel doesn't by default).

## Deploy (Vercel)

Vercel auto-detects React Router (the Vercel preset is wired in
`react-router.config.ts`). Connect the repo in Vercel, then set the env var:

- `VITE_API_URL = https://api.auction.ike.dev`

Build command `npm run build`, output handled by the preset. Because the backend is on a
different origin, make sure the backend's `ALLOWED_ORIGINS` includes this Vercel domain so
the browser can call the API and open the socket.

The previous Next.js app is preserved under `legacy/` for reference.
