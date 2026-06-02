import { useState } from "react";
import { validateBidder } from "../lib/bidder";
import type { Bidder } from "../lib/types";

export function BidderModal({
  open,
  initial,
  onCancel,
  onSave,
}: {
  open: boolean;
  initial: Bidder | null;
  onCancel: () => void;
  onSave: (bidder: Bidder) => void;
}) {
  const [form, setForm] = useState<Bidder>(initial || { name: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { value, error } = validateBidder(form);
    if (error || !value) return setError(error || "Invalid details.");
    onSave(value);
  };

  const field = (k: keyof Bidder) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 dark:bg-black/70 sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl ring-slate-200 dark:bg-slate-900 dark:ring-1 dark:ring-white/10 sm:rounded-2xl">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enter your details to bid</h2>
        <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">
          Your info is never shown publicly — bids display a masked email only.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input className={inputClass} placeholder="Full name" value={form.name} onChange={field("name")} autoFocus />
          <input className={inputClass} type="email" inputMode="email" placeholder="Email address" value={form.email} onChange={field("email")} />
          <input className={inputClass} type="tel" inputMode="tel" placeholder="Phone number" value={form.phone} onChange={field("phone")} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Save &amp; continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
