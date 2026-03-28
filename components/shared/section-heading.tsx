type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignmentClass = align === "left" ? "text-left" : "text-center";
  const widthClass = align === "left" ? "max-w-2xl" : "mx-auto max-w-3xl";

  return (
    <div className={`${widthClass} ${alignmentClass} mb-12`}>
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
    </div>
  );
}
