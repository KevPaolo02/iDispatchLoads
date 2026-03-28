import Link from "next/link";

const heroBenefits = [
  "Save hours every day",
  "Get better rates",
  "Stay consistently loaded",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(11,18,32,0.92))]" />
      <div className="absolute inset-y-0 right-[-12%] hidden w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(248,250,252,0.14),_transparent_58%)] blur-3xl lg:block" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
            For Owner-Operators
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop Wasting Time on Cheap Loads and Endless Broker Calls
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
            We handle the dispatch work, negotiate stronger rates, and keep
            your truck moving so you can stay on the road and earn more.
          </p>
          <ul className="mt-8 grid gap-3 text-base text-slate-100 sm:max-w-lg">
            {heroBenefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                <span className="font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              data-analytics-event="cta_clicked"
              data-analytics-label="Get a Dispatcher Today"
              data-analytics-location="hero-primary"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
            >
              Get a Dispatcher Today
            </Link>
            <Link
              href="/services"
              data-analytics-event="cta_clicked"
              data-analytics-label="See How We Help"
              data-analytics-location="hero-secondary"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See How We Help
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm sm:col-span-2">
            <p className="text-sm text-cyan-300">Built for Owner-Operators</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              If you are still booking your own freight, you are spending too
              much time working on dispatch instead of driving revenue.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-300">Direct Outcome</p>
            <p className="mt-3 text-lg font-semibold text-white">
              You drive, we handle the calls, paperwork, and negotiation.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(34,211,238,0.18),_rgba(255,255,255,0.03))] p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-200">Revenue Focus</p>
            <p className="mt-3 text-lg font-semibold text-white">
              Better rates and more consistent loads mean more productive weeks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
