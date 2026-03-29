"use client";

import { useState, useTransition } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [didCopy, setDidCopy] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDidCopy(true);
            window.setTimeout(() => setDidCopy(false), 1800);
          } catch {
            setDidCopy(false);
          }
        });
      }}
      className={`rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60 ${className}`}
    >
      {didCopy ? "Copied" : label}
    </button>
  );
}
