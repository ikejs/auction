import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./api";
import type { AuctionState, Bidder } from "./types";

type Status = "connecting" | "connected" | "disconnected";

/**
 * Live auction connection. Seeds from the SSR `initial` state, then keeps it in
 * sync over socket.io: joins the auction room, applies "state" broadcasts, and
 * surfaces bid errors. `onAccepted` fires only for this client's own bids.
 */
export function useAuctionSocket(
  initial: AuctionState,
  slug: string | undefined,
  onAccepted?: (itemId: string) => void
) {
  const [state, setState] = useState<AuctionState>(initial);
  const [status, setStatus] = useState<Status>("connecting");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const acceptedRef = useRef(onAccepted);
  acceptedRef.current = onAccepted;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("join", slug ? { slug } : {});
    });
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("disconnected"));
    socket.on("state", (s: AuctionState) => setState(s));
    socket.on("err", ({ message }: { message: string }) => setError(message));
    socket.on("bid:ok", ({ itemId }: { itemId: string }) => acceptedRef.current?.(itemId));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [slug]);

  const placeBid = useCallback((itemId: string, bidder: Bidder, amount: number) => {
    setError(null);
    socketRef.current?.emit("bid", { itemId, bidder, amount });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { state, status, error, clearError, placeBid };
}
