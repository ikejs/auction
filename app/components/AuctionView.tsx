import { useEffect, useState } from "react";
import { useAuctionSocket } from "../lib/useAuctionSocket";
import { loadBidder, saveBidder } from "../lib/bidder";
import { playBidSound } from "../lib/sound";
import { imageUrl, type Theme } from "../lib/api";
import type { AuctionState, Bidder } from "../lib/types";
import { Countdown } from "./Countdown";
import { ItemCard } from "./ItemCard";
import { BidderModal } from "./BidderModal";

export function AuctionView({
  initialState,
  slug,
  theme = "light",
  embedded = false,
}: {
  initialState: AuctionState;
  slug?: string;
  theme?: Theme;
  embedded?: boolean;
}) {
  const { state, status, error, clearError, placeBid } = useAuctionSocket(
    initialState,
    slug,
    () => playBidSound()
  );

  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState<{ itemId: string; amount: number } | null>(null);

  useEffect(() => setBidder(loadBidder()), []);

  // Embed: report height so the host iframe auto-resizes, and signal modal
  // open/close so the host can expand the iframe to a full-viewport overlay.
  useEffect(() => {
    if (!embedded || typeof window === "undefined" || window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: "rp-auction-height", height: document.documentElement.scrollHeight },
        "*"
      );
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.documentElement);
    window.addEventListener("load", post);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", post);
    };
  }, [embedded, state]);

  useEffect(() => {
    if (!embedded || typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage({ type: "rp-auction-modal", open: modalOpen }, "*");
  }, [embedded, modalOpen]);

  const handleBid = (itemId: string, amount: number) => {
    if (!bidder) {
      setPending({ itemId, amount });
      setModalOpen(true);
      return;
    }
    placeBid(itemId, bidder, amount);
  };

  const handleSaveBidder = (b: Bidder) => {
    saveBidder(b);
    setBidder(b);
    setModalOpen(false);
    if (pending) {
      placeBid(pending.itemId, b, pending.amount);
      setPending(null);
    }
  };

  if (!state) {
    return (
      <div
        data-theme={theme}
        className={`flex flex-col items-center justify-center gap-2 bg-slate-100 px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
          embedded ? "py-20" : "min-h-screen"
        }`}
      >
        <h1 className="text-2xl font-bold sm:text-3xl">No active auction</h1>
        <p className="text-slate-500 dark:text-slate-400">Please check back soon.</p>
      </div>
    );
  }

  const { auction, items } = state;
  const statusDot =
    auction.status === "live"
      ? "bg-emerald-400"
      : auction.status === "scheduled"
        ? "bg-amber-400"
        : "bg-slate-400";

  return (
    <div
      data-theme={theme}
      className="min-h-screen overflow-x-hidden bg-slate-100 pb-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    >
      {/* Bidding-as bar (dark accent in both themes) */}
      {bidder ? (
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-slate-900 px-4 py-1.5 text-xs text-white sm:text-sm">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-500 text-[10px] font-bold uppercase">
            {bidder.name.charAt(0)}
          </span>
          <span className="truncate">
            Bidding as <span className="font-semibold">{bidder.name}</span>
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            change
          </button>
        </div>
      ) : null}

      {/* Hero (dark in both themes — sits behind the banner image) */}
      <header className="relative isolate overflow-hidden bg-slate-950 text-white">
        {auction.headerImage ? (
          <img
            src={imageUrl(auction.headerImage)}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/40 to-slate-950" />
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:py-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${statusDot} ${auction.status === "live" ? "animate-pulse" : ""}`} />
            {auction.status}
          </div>
          <h1 className="text-balance text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {auction.title}
          </h1>
          {auction.description ? (
            <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-white/70 sm:text-base">
              {auction.description}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center">
            <Countdown auction={auction} />
          </div>
          {status === "disconnected" ? (
            <p className="mt-3 text-xs text-amber-300">Reconnecting…</p>
          ) : null}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
        {auction.instructions ? (
          <div className="mx-auto mb-6 max-w-3xl rounded-xl bg-white p-4 text-center text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10 sm:mb-10 sm:p-5">
            {auction.instructions.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : null}

        {items.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">
            No items in this auction yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} auction={auction} onBid={handleBid} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
          Bids are binding. Top bidders will be notified by email.
        </p>
      </main>

      {/* Error toast */}
      {error ? (
        <div className="fixed inset-x-3 bottom-4 z-50 flex justify-center sm:inset-x-0">
          <div className="flex max-w-md items-center gap-3 rounded-xl bg-red-600 px-4 py-2.5 text-sm text-white shadow-lg">
            <span className="flex-1">{error}</span>
            <button onClick={clearError} aria-label="Dismiss" className="shrink-0 font-bold">
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <BidderModal
        open={modalOpen}
        initial={bidder}
        onCancel={() => setModalOpen(false)}
        onSave={handleSaveBidder}
      />
    </div>
  );
}
