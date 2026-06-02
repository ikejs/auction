import { formatMoney } from "../lib/format";
import type { Bidder } from "../lib/types";

export function ConfirmBidModal({
  open,
  itemName,
  amount,
  currency,
  bidder,
  onCancel,
  onConfirm,
  onEditInfo,
}: {
  open: boolean;
  itemName: string;
  amount: number;
  currency: string;
  bidder: Bidder | null;
  onCancel: () => void;
  onConfirm: () => void;
  onEditInfo: () => void;
}) {
  if (!open || !bidder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 dark:bg-black/70 sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-white/10 sm:rounded-2xl">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm your bid</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">on {itemName}</p>

        <div className="my-4 rounded-xl bg-indigo-50 py-4 text-center dark:bg-indigo-500/10">
          <div className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-300">
            {formatMoney(amount, currency)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Bidding as
          </p>
          <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{bidder.name}</p>
          <p className="text-slate-500 dark:text-slate-400">{bidder.email}</p>
          <p className="text-slate-500 dark:text-slate-400">{bidder.phone}</p>
          <button
            type="button"
            onClick={onEditInfo}
            className="mt-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Edit my info
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Bids are binding. You'll receive an email confirmation.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Confirm bid
          </button>
        </div>
      </div>
    </div>
  );
}
