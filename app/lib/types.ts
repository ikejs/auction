// Public auction shape returned by the DigitalOcean REST API and broadcast
// over socket.io. Emails are already masked server-side; phones are never sent.

export type PublicBid = {
  amount: number;
  bidder: string; // masked email, e.g. "j****e@g****m"
  createdAt: string;
};

export type PublicItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  bids: PublicBid[];
};

export type PublicAuction = {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  headerImage: string;
  startAt: string;
  endAt: string;
  status: "scheduled" | "live" | "closed";
  bidIncrement: number;
  maxBid: number;
  currency: string;
};

export type AuctionState = {
  auction: PublicAuction;
  items: PublicItem[];
} | null;

export type Bidder = { name: string; email: string; phone: string };
