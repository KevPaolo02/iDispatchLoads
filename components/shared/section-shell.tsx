import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  id?: string;
  tone?: "light" | "dark" | "brand";
  className?: string;
};

const toneClasses = {
  light: "bg-white",
  dark: "bg-slate-950",
  brand:
    "bg-[linear-gradient(180deg,_rgba(240,249,255,0.9),_rgba(255,255,255,1))]",
};

export function SectionShell({
  children,
  id,
  tone = "light",
  className = "",
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`${toneClasses[tone]} ${className} py-20 sm:py-24`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10">
        {children}
      </div>
    </section>
  );
}
