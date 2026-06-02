import { useEffect, useState } from "react";
import { relativeTime } from "../lib/format";

// Renders relative time only after mount to avoid SSR/client hydration drift.
export function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => setText(relativeTime(iso));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [iso]);
  return <span suppressHydrationWarning>{text}</span>;
}
