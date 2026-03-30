import Link from "next/link";

import { ContactForm } from "@/components/marketing/contact-form";
import { buildWhatsAppHref } from "@/lib/utils";

const heroBenefits = [
  "Respuesta rápida por WhatsApp",
  "Activación rápida si vemos fit",
  "Más continuidad en NY / NJ / CT / PA",
];

export function HeroEs() {
  const whatsAppHref = buildWhatsAppHref(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    "Hola, quiero revisar mi operación con iDispatchLoads. Corro rutas en NY / NJ / CT / PA y quiero saber si encajo con su dispatch.",
  );

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(11,18,32,0.92))]" />
      <div className="absolute inset-y-0 right-[-12%] hidden w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(248,250,252,0.14),_transparent_58%)] blur-3xl lg:block" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Dispatch en Español Para Conductores del Noreste
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Activa tu dispatch rápido y deja de perder semanas en cargas flojas
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
            Hacemos dispatch para conductores y dueños-operadores que corren
            NY, NJ, CT y PA. Buscamos cargas, negociamos tarifas, filtramos
            brokers y movemos la operación por WhatsApp para que no pierdas el
            día brincando entre boards, llamadas y mensajes sueltos.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
            Si vemos buen fit, te decimos rápido cómo arrancar sin fee inicial
            ni vueltas raras.
          </div>
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
            {whatsAppHref ? (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                data-analytics-event="cta_clicked"
                data-analytics-label="Hablar por WhatsApp Ahora"
                data-analytics-location="hero-primary-es"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
              >
                Escríbenos por WhatsApp Ahora
              </a>
            ) : (
              <Link
                href="/#contacto"
                data-analytics-event="cta_clicked"
                data-analytics-label="Quiero Revisar Mis Rutas"
                data-analytics-location="hero-primary-es"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
              >
                Activa Tu Dispatch
              </Link>
            )}
            <Link
              href="/#contacto"
              data-analytics-event="cta_clicked"
              data-analytics-label="Ver Si Califico"
              data-analytics-location="hero-secondary-es"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver Si Califico
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Si tu operación no encaja, te lo decimos rápido. Si sí encaja,
            pasamos al siguiente paso sin hacerte perder tiempo.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Revisión Rápida
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Déjanos tus datos y revisamos tu operación rápido.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Este formulario es corto y está hecho para móvil. Si vemos buen
              fit, te respondemos con el siguiente paso.
            </p>
            <div className="mt-5">
              <ContactForm
                idPrefix="hero"
                formLocation="hero_compact_form"
                compact
                showNotes={false}
                showWhatsAppButton={false}
                buttonLabel="Quiero Que Me Contacten"
                pendingLabel="Enviando..."
                successMessage="Recibimos tu información. Si quieres acelerar el proceso, escríbenos por WhatsApp ahora mismo."
                helperText="Nombre, teléfono, equipo y rutas. Eso es suficiente para revisar si encajas."
                labels={{
                  firstName: "Nombre",
                  lastName: "Apellido",
                  email: "Correo",
                  phone: "Teléfono",
                  truckType: "Camión / Tráiler",
                  preferredLanes: "Rutas",
                  notes: "Notas",
                }}
                placeholders={{
                  firstName: "Tu nombre",
                  lastName: "Tu apellido",
                  email: "nombre@correo.com",
                  phone: "(555) 123-4567",
                  truckType: "Car hauler, hotshot, dry van...",
                  preferredLanes: "NY, NJ, CT, PA...",
                  notes: "",
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm sm:col-span-2">
            <p className="text-sm text-cyan-300">WhatsApp Primero</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              Este servicio está pensado para conductores que prefieren hablar
              directo, cerrar rápido y resolver por WhatsApp en vez de correos
              eternos.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-300">Baja Confianza, Cero Vueltas</p>
            <p className="mt-3 text-lg font-semibold text-white">
              No te pedimos llamadas eternas ni promesas vacías. Revisamos tus
              rutas, tu equipo y te decimos rápido si tiene sentido trabajar
              contigo o no.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(34,211,238,0.18),_rgba(255,255,255,0.03))] p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-200">No Solo Buscamos Cargas</p>
            <p className="mt-3 text-lg font-semibold text-white">
              Buscamos, filtramos, negociamos y te damos seguimiento. La idea
              es que sientas una operación más clara, no otro freelancer
              improvisando.
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
