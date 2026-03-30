import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/marketing/contact-form";
import { HeroEs } from "@/components/marketing/hero-es";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";
import { buildWhatsAppHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dispatch en Español por WhatsApp para Conductores de NY, NJ, CT y PA",
  description:
    "Dispatch en español por WhatsApp para conductores y dueños-operadores que corren NY, NJ, CT y PA. Más cargas, menos tiempo muerto y respuesta rápida el mismo día.",
  keywords: [
    "dispatch en español para troqueros",
    "dispatch por whatsapp en español",
    "dispatch para conductores en new york",
    "dispatch para conductores en new jersey",
    "dispatch en español connecticut",
    "dispatch en español pennsylvania",
    "dispatch noreste en español",
    "dispatch para owner operators en ny nj ct pa",
  ],
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      en: "/en",
    },
  },
  category: "Transportation",
  openGraph: {
    title: "Dispatch en Español por WhatsApp para Conductores de NY, NJ, CT y PA",
    description:
      "Ayudamos a conductores y dueños-operadores a conseguir más cargas, negociar mejor y mantenerse en movimiento en el corredor del noreste.",
    url: "https://idispatchloads.com",
    locale: "es_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dispatch en español para conductores del noreste",
      },
    ],
  },
  twitter: {
    title: "Dispatch en Español por WhatsApp para Conductores de NY, NJ, CT y PA",
    description:
      "Más cargas, menos tiempo muerto y respuesta por WhatsApp para conductores del noreste.",
    images: ["/twitter-image"],
  },
};

const services = [
  {
    title: "Búsqueda con Criterio",
    description:
      "No te llenamos la semana con cualquier cosa. Buscamos movimientos que sí tengan sentido para tu equipo, tu base y tus rutas del noreste.",
  },
  {
    title: "Filtro de Brokers",
    description:
      "Filtramos brokers, tiempos muertos y cargas flojas. La idea no es sonar ocupados. La idea es que tu semana deje más dinero y menos desgaste.",
  },
  {
    title: "Negociación con Sentido",
    description:
      "Negociamos pensando en tu ingreso, tu continuidad y el siguiente movimiento, no solo en cerrar la primera carga que aparezca.",
  },
  {
    title: "Seguimiento por WhatsApp",
    description:
      "Mantenemos la comunicación clara por WhatsApp para que sepas qué sigue, qué se movió y dónde está el próximo paso sin perseguir a nadie.",
  },
];

const steps = [
  {
    step: "01",
    title: "Nos Escribes y Revisamos Fit",
    description:
      "Nos mandas tu información o nos escribes por WhatsApp. Revisamos tu equipo, base y rutas para decirte rápido si tu operación encaja con nuestro enfoque.",
  },
  {
    step: "02",
    title: "Tomamos Búsqueda, Filtro y Negociación",
    description:
      "Buscamos cargas, filtramos brokers, negociamos tarifas y organizamos el movimiento con una lógica clara para que no sigas resolviendo todo tú solo.",
  },
  {
    step: "03",
    title: "Seguimos la Operación y el Siguiente Paso",
    description:
      "Mientras tú manejas, damos seguimiento por WhatsApp, cuidamos detalles operativos y trabajamos el próximo movimiento para reducir tiempos muertos.",
  },
];

const trustSignals = [
  {
    title: "WhatsApp Directo, No Call Center",
    description:
      "Este servicio está pensado para conductores que prefieren resolver rápido. Puedes escribir directo, hablar con una persona real y saber hoy mismo si hay fit.",
  },
  {
    title: "No Te Hacemos Perder Tiempo",
    description:
      "Si tu operación no encaja, te lo decimos. Si sí encaja, pasamos al siguiente paso sin vueltas, sin proceso inflado y sin venderte humo.",
  },
  {
    title: "Dispatcher Asignado y Seguimiento",
    description:
      "No se siente como un favor aislado. Se siente como una operación con seguimiento diario, comunicación clara y alguien pendiente del movimiento.",
  },
];

const fitPoints = [
  "Trabajas desde, por, o hacia New York, New Jersey, Connecticut o Pennsylvania.",
  "Prefieres resolver por WhatsApp y saber rápido si esto vale la pena para tu operación.",
  "No quieres seguir corriendo cargas flojas solo por llenar la semana.",
];

const pricingOptions = [
  {
    title: "Porcentaje por carga",
    description:
      "Ideal si prefieres pagar en función de las cargas que se mueven y mantener el costo alineado con tu operación.",
  },
  {
    title: "Tarifa semanal",
    description:
      "Ideal si prefieres una tarifa fija semanal y trabajar con un costo más predecible para tu operación.",
  },
];

const weeklyExample = [
  { label: "Cargas trabajadas", value: "4" },
  { label: "Bruto semanal", value: "$7,800" },
  { label: "Fee de dispatch", value: "$780" },
  { label: "Neto estimado", value: "$7,020" },
];

const faqs = [
  {
    question:
      "¿Con qué tipo de conductores trabaja iDispatchLoads.com en NY, NJ, CT y PA?",
    answer:
      "Nos enfocamos en conductores, dueños-operadores y pequeñas flotillas que corren desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania. El mejor fit es alguien que quiere más continuidad, menos tiempo perdido y comunicación directa.",
  },
  {
    question: "¿Por qué enfocarse solo en NY, NJ, CT y PA me beneficia?",
    answer:
      "Porque ese enfoque permite trabajar con más criterio. En lugar de correr cualquier cosa en cualquier estado, buscamos mejores decisiones, más continuidad y menos vueltas inútiles dentro del corredor que tú realmente trabajas.",
  },
  {
    question: "¿Solo trabajan rutas del noreste?",
    answer:
      "Nuestro enfoque principal es el corredor del noreste porque ahí queremos construir el mejor fit. Si tu operación trabaja regularmente NY, NJ, CT y PA, es exactamente el tipo de operación que queremos apoyar.",
  },
  {
    question: "¿Cómo me ayuda este servicio de dispatch a ahorrar tiempo?",
    answer:
      "Nos encargamos de buscar cargas, hablar con brokers, negociar tarifas y organizar el dispatch para que tú no pases el día entero persiguiendo la próxima carga ni esperando respuestas lentas.",
  },
  {
    question: "¿De verdad me pueden ayudar a conseguir mejores tarifas?",
    answer:
      "Sí. Una parte clave del servicio es negociar pensando en tu ingreso y en las rutas que de verdad te convienen, no en aceptar cualquier carga barata.",
  },
  {
    question: "¿Qué información necesito para empezar?",
    answer:
      "Para calificar rápido necesitamos tu nombre, teléfono, correo, tipo de camión o tráiler y las rutas que prefieres correr en el noreste. Con eso podemos decirte rápido si tu operación encaja.",
  },
  {
    question: "¿Cuánto cobra iDispatchLoads.com?",
    answer:
      "Trabajamos con dos estructuras simples: porcentaje por carga o una tarifa semanal. La mejor opción depende de cómo prefieras manejar el costo de dispatch en tu operación y te la explicamos directo, sin tabla complicada.",
  },
];

export default function Home() {
  const whatsAppHref = buildWhatsAppHref(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    "Hola, quiero revisar mi operación con iDispatchLoads. Corro rutas en NY / NJ / CT / PA y quiero hablar por WhatsApp.",
  );
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com",
      inLanguage: "es-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com",
      logo: "https://idispatchloads.com/opengraph-image",
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com",
      description:
        "Servicios de dispatch para conductores y dueños-operadores que trabajan desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania.",
      areaServed: [
        { "@type": "State", name: "New York" },
        { "@type": "State", name: "New Jersey" },
        { "@type": "State", name: "Connecticut" },
        { "@type": "State", name: "Pennsylvania" },
      ],
      serviceType: [
        "Búsqueda y reserva de cargas",
        "Negociación de tarifas",
        "Comunicación con brokers",
        "Manejo de papelería",
      ],
      audience: {
        "@type": "Audience",
        audienceType: "Conductores, dueños-operadores y pequeñas flotillas",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <HeroEs />

      <SectionShell id="cierre-rapido" tone="brand" className="py-12 sm:py-14">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Cierre Rápido
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Si prefieres cerrar rápido, escríbenos por WhatsApp primero.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Para este tipo de operación, WhatsApp suele cerrar más rápido que
              correo. Te respondemos, revisamos fit y te decimos hoy mismo si
              tiene sentido avanzar.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {whatsAppHref ? (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                data-analytics-event="cta_clicked"
                data-analytics-label="Escribir por WhatsApp"
                data-analytics-location="quick-close-band"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Escríbenos y Revisa Tu Fit
              </a>
            ) : null}
            <Link
              href="/#contacto"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Llenar Formulario
            </Link>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="servicios" tone="light">
        <SectionHeading
          eyebrow="Qué Resolvemos"
          title="Lo que hacemos mejor para una operación que corre NY, NJ, CT y PA."
          description="Si todavía estás resolviendo todo tú solo entre load boards, brokers y seguimiento, el problema no es solo tiempo. También es dinero mal negociado, continuidad mal trabajada y demasiada fricción diaria."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]"
            >
              <div className="mb-4 h-1.5 w-14 rounded-full bg-[var(--color-accent)]" />
              <h3 className="text-xl font-semibold text-slate-900">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="confianza" tone="dark">
        <SectionHeading
          eyebrow="Por Qué Confiar"
          title="La confianza no se gana con palabras suaves. Se gana con claridad."
          description="Para un conductor escéptico, lo más importante es sentir que aquí hay criterio, velocidad y una forma seria de trabajar."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Solo NY / NJ / CT / PA
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Nos enfocamos en el corredor donde sí quieres producir. Eso nos
              permite filtrar mejor y decidir más rápido.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Comunicación directa por WhatsApp
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              No te mandamos a esperar un correo genérico. Hablas con una
              persona real y sabes rápido si hay fit o no.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Sin vueltas si no encaja
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Si tu operación no encaja, te lo decimos. Si sí encaja, pasamos
              al siguiente paso sin inflar el proceso.
            </p>
          </article>
        </div>
      </SectionShell>

      <SectionShell id="ejemplo-semana" tone="brand">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Ejemplo de Semana
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Un conductor piensa en bruto semanal. Así es como debes vender el valor.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              No basta con decir “buscamos cargas”. Un conductor escéptico quiere
              visualizar qué cambia en su semana. Este bloque convierte mejor
              porque habla en dinero, no en promesas abstractas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {weeklyExample.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="como-funciona" tone="light">
        <SectionHeading
          eyebrow="Cómo Funciona"
          title="Así se ve el proceso cuando cerramos el mismo día."
          description="No lo tratamos como una página bonita. Lo tratamos como una operación real: revisamos fit, tomamos la conversación y si todo encaja avanzamos sin vueltas."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.step}
              className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Paso {step.step}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="quienes-califican" tone="brand">
        <SectionHeading
          eyebrow="Con Quién Trabajamos"
          title="No trabajamos con cualquiera. Trabajamos con conductores que quieren subir el nivel de su semana."
          description="Si tú trabajas NY, NJ, CT y PA con frecuencia, prefieres comunicación directa y no quieres seguir aceptando cargas flojas, queremos hablar contigo."
        />
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          {fitPoints.map((point) => (
            <div
              key={point}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm leading-7 text-slate-700 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]"
            >
              {point}
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {trustSignals.map((signal) => (
            <article
              key={signal.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Baja Fricción
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                {signal.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {signal.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="precios" tone="light">
        <SectionHeading
          eyebrow="Cómo Cobramos"
          title="Dos formas simples de trabajar con nosotros."
          description="No publicamos una tabla complicada porque primero vemos si tu operación encaja. Si sí encaja, te explicamos directo si te conviene porcentaje por carga o tarifa semanal."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {pricingOptions.map((option) => (
            <article
              key={option.title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Opción
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                {option.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {option.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-sm leading-7 text-emerald-900">
            Sin fee inicial raro
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-sm leading-7 text-emerald-900">
            Si no hay fit, te lo decimos rápido
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-sm leading-7 text-emerald-900">
            La idea es que tú ruedes mejor, no venderte una llamada
          </div>
        </div>
      </SectionShell>

      <SectionShell id="sistema" tone="dark">
        <SectionHeading
          eyebrow="Sistema Real"
          title="Esto tiene que sentirse como una máquina de trabajo, no como un favor."
          description="Cuando un conductor decide confiar, necesita sentir estructura. Necesita saber quién responde, cómo se sigue la carga y cómo se mueve la comunicación."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Dispatcher asignado
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              No queda todo suelto. Hay una persona pendiente de tu operación y
              del siguiente movimiento.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Seguimiento diario
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Carga, comunicación y próximos pasos. La operación tiene orden,
              no mensajes perdidos.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white">
              Comunicación con brokers
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Búsqueda, negociación, rate confirmations y seguimiento para que
              tú no vivas pegado al teléfono todo el día.
            </p>
          </article>
        </div>
      </SectionShell>

      <SectionShell id="contacto" tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Contacto"
              title="¿Corres NY, NJ, CT o PA y quieres resolver esto hoy?"
              description="Escríbenos por WhatsApp o déjanos tu información. Si vemos buen fit, te explicamos el siguiente paso el mismo día y sin vueltas."
              align="left"
            />
            <div className="mt-8 grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Revisamos rápido si tu operación encaja
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Si prefieres WhatsApp, esa es la vía más rápida
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Si hay fit, pasamos al siguiente paso el mismo día
              </div>
            </div>
            {whatsAppHref ? (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                data-analytics-event="cta_clicked"
                data-analytics-label="WhatsApp contacto"
                data-analytics-location="contact-panel"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Escríbenos y Te Respondemos Rápido
              </a>
            ) : null}
          </div>

          <ContactForm
            buttonLabel="Activa Tu Revisión"
            pendingLabel="Enviando..."
            successMessage="Recibimos tu información. Si quieres acelerar el proceso, escríbenos por WhatsApp y revisamos tu operación hoy mismo."
            helperText="Si prefieres cerrar rápido, usa el botón de WhatsApp. Si prefieres dejar tus datos primero, este formulario llega directo a nuestro equipo."
            whatsAppLabel="Escríbenos por WhatsApp"
            whatsAppMessage="Hola, acabo de llenar el formulario de iDispatchLoads y quiero revisar mi operación hoy mismo."
            labels={{
              firstName: "Nombre",
              lastName: "Apellido",
              email: "Correo Electrónico",
              phone: "Teléfono",
              truckType: "Tipo de Camión / Tráiler",
              preferredLanes: "Rutas Preferidas / Cobertura en el Noreste",
              notes: "Notas",
            }}
            placeholders={{
              firstName: "Tu nombre",
              lastName: "Tu apellido",
              email: "nombre@correo.com",
              phone: "(555) 123-4567",
              truckType: "Car hauler, hotshot, dry van...",
              preferredLanes: "NY a PA, pasando por NJ, corredor de CT...",
              notes:
                "Cuéntanos cómo trabajas, desde dónde sales y si prefieres hablar por WhatsApp hoy mismo.",
            }}
          />
        </div>
      </SectionShell>
    </>
  );
}
