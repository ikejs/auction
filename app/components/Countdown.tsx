import { useEffect, useState } from "react";
import { timeLeft } from "../lib/format";
import type { PublicAuction } from "../lib/types";

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[2.5rem] flex-col items-center rounded-lg bg-white/10 px-2 py-1.5 backdrop-blur sm:min-w-[3rem]">
      <span className="font-bold leading-none tabular-nums text-white sm:text-xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-white/50 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export function Countdown({ auction }: { auction: PublicAuction }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (auction.status === "closed") {
    return (
      <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
        Bidding has closed
      </p>
    );
  }

  const scheduled = auction.status === "scheduled";
  const target = scheduled ? auction.startAt : auction.endAt;
  const label = scheduled ? "Starts in" : "Ends in";

  if (now === null) {
    // Pre-hydration placeholder keeps SSR + first client render identical.
    return <p className="text-sm font-medium text-white/70">{label}…</p>;
  }

  const t = timeLeft(target, now);
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>
      <div className="flex items-stretch gap-1.5 sm:gap-2">
        {t.days > 0 ? <Segment value={t.days} label="days" /> : null}
        <Segment value={t.hours} label="hrs" />
        <Segment value={t.minutes} label="min" />
        <Segment value={t.seconds} label="sec" />
      </div>
    </div>
  );
}
