import { cn } from "@/lib/utils";

type FlashBannerProps = {
  type: "error" | "success";
  message: string;
};

export function FlashBanner({ type, message }: FlashBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        type === "success"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
          : "border-rose-400/30 bg-rose-400/10 text-rose-100",
      )}
    >
      {message}
    </div>
  );
}
