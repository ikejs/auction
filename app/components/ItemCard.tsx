import { useEffect, useRef, useState } from "react";
import { formatMoney } from "../lib/format";
import { imageUrl } from "../lib/api";
import type { PublicAuction, PublicItem } from "../lib/types";
import { RelativeTime } from "./RelativeTime";

export function ItemCard({
  item,
  auction,
  onBid,
}: {
  item: PublicItem;
  auction: PublicAuction;
  onBid: (itemId: string, amount: number) => void;
}) {
  const { bidIncrement: inc, maxBid, currency } = auction;
  const minNext = Math.max(item.currentBid, item.startingBid) + inc;
  const live = auction.status === "live";

  const [amt, setAmt] = useState<number>(minNext);
  const [hint, setHint] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const prevBid = useRef(item.currentBid);

  useEffect(() => {
    setAmt((a) => (a < minNext ? minNext : a));
  }, [minNext]);

  useEffect(() => {
    if (item.currentBid !== prevBid.current) {
      prevBid.current = item.currentBid;
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(id);
    }
  }, [item.currentBid]);

  const clamp = (v: number) => Math.min(maxBid, Math.max(minNext, v));
  const step = (dir: 1 | -1) => {
    setHint(null);
    setAmt((a) => clamp(a + dir * inc));
  };

  const submit = () => {
    setHint(null);
    if (!Number.isInteger(amt)) return setHint("Whole dollars only.");
    if (amt > maxBid) return setHint(`Max bid is ${formatMoney(maxBid, currency)}.`);
    if (amt < minNext) return setHint(`Bid at least ${formatMoney(minNext, currency)}.`);
    onBid(item.id, amt);
  };

  const visibleBids = showAll ? item.bids : item.bids.slice(0, 3);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md dark:bg-slate-900 dark:ring-white/10 dark:hover:ring-white/20">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {item.image ? (
          <img
            src={imageUrl(item.image)}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-slate-300 dark:text-slate-600">
            No image
          </div>
        )}
        {item.bidCount > 0 ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            {item.bidCount} bid{item.bidCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
            {item.name}
          </h3>
          {item.subtitle ? (
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.subtitle}</p>
          ) : null}
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {item.description}
            </p>
          ) : null}
        </div>

        {/* Current bid */}
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {auction.status === "closed"
                ? "Winning bid"
                : item.currentBid
                  ? "Current bid"
                  : "Opening bid"}
            </p>
            <p
              className={`text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white ${
                flash ? "bid-flash rounded px-1" : ""
              }`}
            >
              {formatMoney(item.currentBid || item.startingBid, currency)}
            </p>
          </div>
          {item.bids[0] ? (
            <div className="min-w-0 max-w-[45%] pb-1 text-right text-xs text-slate-400 dark:text-slate-500">
              <span className="block">leader</span>
              <span className="block truncate font-medium text-slate-500 dark:text-slate-300">
                {item.bids[0].bidder}
              </span>
            </div>
          ) : null}
        </div>

        {/* Bid controls */}
        {live ? (
          <div>
            <div className="flex items-stretch gap-2">
              <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  aria-label="Lower bid"
                  onClick={() => step(-1)}
                  className="px-3 text-lg font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5"
                  disabled={amt <= minNext}
                >
                  −
                </button>
                <label className="flex min-w-0 flex-1 cursor-text items-center justify-center gap-0.5 border-x border-slate-200 dark:border-white/10">
                  <span className="text-base font-semibold text-slate-400 dark:text-slate-500">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={amt}
                    min={minNext}
                    step={inc}
                    onChange={(e) => setAmt(Math.floor(Number(e.target.value)) || 0)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="w-16 border-0 bg-transparent py-2.5 text-left text-base font-semibold tabular-nums text-slate-900 focus:outline-none focus:ring-0 dark:text-white"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Raise bid"
                  onClick={() => step(1)}
                  className="px-3 text-lg font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  +
                </button>
              </div>
              <button
                onClick={submit}
                className="shrink-0 rounded-xl bg-indigo-600 px-5 font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
              >
                Bid
              </button>
            </div>
            <p
              className={`mt-1.5 text-xs ${
                hint ? "text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {hint || `Min next bid ${formatMoney(minNext, currency)} · +${formatMoney(inc, currency)} steps`}
            </p>
          </div>
        ) : null}

        {/* Bid history */}
        {item.bids.length > 0 ? (
          <div className="mt-auto border-t border-slate-100 pt-3 dark:border-white/10">
            <ul className="space-y-1.5">
              {visibleBids.map((b, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        showAll || i > 0 ? "bg-slate-300 dark:bg-slate-600" : "bg-emerald-500"
                      }`}
                    />
                    <span className="truncate text-slate-500 dark:text-slate-400">{b.bidder}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {formatMoney(b.amount, currency)}
                    </span>
                    <span className="hidden text-xs text-slate-300 dark:text-slate-600 sm:inline">
                      <RelativeTime iso={b.createdAt} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {item.bids.length > 3 ? (
              <button
                onClick={() => setShowAll((s) => !s)}
                className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {showAll ? "Show less" : `View all ${item.bids.length} bids`}
              </button>
            ) : null}
          </div>
        ) : live ? (
          <p className="mt-auto pt-1 text-sm text-slate-400 dark:text-slate-500">
            No bids yet — start it off!
          </p>
        ) : null}
      </div>
    </article>
  );
}
