import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md">
            <Link
              href="/"
              className="text-lg font-semibold tracking-[0.18em] text-white uppercase"
            >
              iDispatchLoads.com
            </Link>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Reliable dispatch services for owner operators who want better
              loads, stronger rates, and smoother load management.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="grid gap-3 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-5 text-xs text-slate-500">
          <p>
            Powered by{" "}
            <a
              href="https://colcore.co"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-300"
            >
              ColCore.co
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
