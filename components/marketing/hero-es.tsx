import Link from "next/link";

const heroBenefits = [
  "Ahorra horas todos los días",
  "Consigue mejores tarifas",
  "Mantente con cargas constantes en tus rutas",
];

export function HeroEs() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(11,18,32,0.92))]" />
      <div className="absolute inset-y-0 right-[-12%] hidden w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(248,250,252,0.14),_transparent_58%)] blur-3xl lg:block" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Para Conductores de NY / NJ / CT / PA
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Deja de Perder Horas Persiguiendo Cargas Baratas en el Noreste
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
            Ayudamos a conductores y dueños-operadores que trabajan desde, por, o
            hacia New York, New Jersey, Connecticut y Pennsylvania a ahorrar
            tiempo, conseguir mejores cargas y mantenerse en movimiento sin
            vivir pegados al teléfono.
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
              href="/#contacto"
              data-analytics-event="cta_clicked"
              data-analytics-label="Consigue Dispatcher Hoy"
              data-analytics-location="hero-primary-es"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
            >
              Consigue Dispatcher Hoy
            </Link>
            <Link
              href="/#como-funciona"
              data-analytics-event="cta_clicked"
              data-analytics-label="Ver Si Calificas"
              data-analytics-location="hero-secondary-es"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver Si Calificas
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm sm:col-span-2">
            <p className="text-sm text-cyan-300">Enfoque en el Corredor Noreste</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              Buscamos choferes que trabajen cargas en New York, New Jersey,
              Connecticut y Pennsylvania, no conductores de cualquier zona.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-300">Mejor Para Ti Si</p>
            <p className="mt-3 text-lg font-semibold text-white">
              Quieres mantenerte en el noreste con cargas más consistentes y
              menos viajes al azar.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(34,211,238,0.18),_rgba(255,255,255,0.03))] p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-200">Enfocado en Ingreso</p>
            <p className="mt-3 text-lg font-semibold text-white">
              Mejores tarifas y mejor planificación significan semanas más
              productivas en el noreste.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
