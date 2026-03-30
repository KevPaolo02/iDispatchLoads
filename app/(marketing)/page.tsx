import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/contact-form";
import { HeroEs } from "@/components/marketing/hero-es";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export const metadata: Metadata = {
  title: "Dispatch en Español para Choferes que Trabajan NY, NJ, CT y PA",
  description:
    "Servicios de dispatch en español para choferes y dueños-operadores que trabajan desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania. Ahorra tiempo, consigue mejores tarifas y mantente en movimiento.",
  keywords: [
    "dispatch en español para troqueros",
    "dispatch para choferes en new york",
    "dispatch para choferes en new jersey",
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
    title: "Dispatch en Español para Choferes que Trabajan NY, NJ, CT y PA",
    description:
      "Ayudamos a choferes y dueños-operadores a conseguir mejores cargas y mantenerse en movimiento en el corredor del noreste.",
    url: "https://idispatchloads.com",
    locale: "es_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dispatch en español para choferes del noreste",
      },
    ],
  },
  twitter: {
    title: "Dispatch en Español para Choferes que Trabajan NY, NJ, CT y PA",
    description:
      "Dispatch en español para choferes que corren NY, NJ, CT y PA.",
    images: ["/twitter-image"],
  },
};

const services = [
  {
    title: "Búsqueda y Reserva de Cargas",
    description:
      "Buscamos y filtramos cargas que sí tengan sentido para tus rutas del noreste para que no pierdas el día revisando publicaciones que no te convienen.",
  },
  {
    title: "Negociación de Tarifas",
    description:
      "Negociamos pensando en tu ingreso para que no aceptes cargas flojas en New York, New Jersey, Connecticut y Pennsylvania.",
  },
  {
    title: "Comunicación con Brokers",
    description:
      "Nos encargamos de llamadas, seguimiento y confirmaciones con brokers para que tú te enfoques en manejar y entregar.",
  },
  {
    title: "Orden y Papelería",
    description:
      "Mantenemos confirmaciones de tarifa y detalles del dispatch organizados para que cada carga salga más clara y con menos estrés.",
  },
];

const benefits = [
  "Ahorra tiempo dejando de brincar entre load boards, llamadas y mensajes todo el día.",
  "Consigue mejores tarifas con alguien peleando por tus números en cargas del corredor NY, NJ, CT y PA.",
  "Mantente con movimiento más constante en la zona donde realmente trabajas, no con viajes al azar.",
];

const steps = [
  {
    step: "01",
    title: "Cuéntanos Cómo Trabajas",
    description:
      "Dinos qué equipo manejas, dónde sales y qué zonas prefieres trabajar dentro del corredor del noreste.",
  },
  {
    step: "02",
    title: "Buscamos Cargas Que Sí Te Sirven",
    description:
      "Filtramos cargas, hablamos con brokers y buscamos mejores opciones para tus rutas en NY, NJ, CT y PA.",
  },
  {
    step: "03",
    title: "Tú Manejas, Nosotros Movemos el Dispatch",
    description:
      "Mientras tú recoges y entregas, nosotros seguimos pendientes de la siguiente carga para ayudarte a mantenerte en movimiento.",
  },
];

const trustSignals = [
  {
    title: "Enfoque Real en el Noreste",
    description:
      "No estamos tratando de trabajar todos los estados del país. Buscamos choferes que sí corren el área de NY, NJ, CT y PA.",
  },
  {
    title: "Soporte Directo de Dispatch",
    description:
      "Tienes un equipo atendiendo brokers, negociando tarifas y cuidando detalles operativos que normalmente te quitan tiempo.",
  },
  {
    title: "Proceso Claro Desde el Inicio",
    description:
      "Pedimos el tipo de camión, rutas preferidas y datos de contacto desde el inicio para saber rápido si eres una buena opción.",
  },
];

const fitPoints = [
  "Trabajas desde, por, o hacia New York, New Jersey, Connecticut o Pennsylvania.",
  "Quieres dejar de vivir pegado al teléfono buscando la próxima carga.",
  "Quieres ayuda de dispatch para mantenerte más cargado y con mejores tarifas en el noreste.",
];

const serviceAreas = [
  {
    title: "Apoyo para Rutas de New York",
    description:
      "Trabajamos con choferes que entran, salen o cruzan New York y necesitan mejor organización, mejores tarifas y menos tiempo perdido.",
  },
  {
    title: "Apoyo para Rutas de New Jersey",
    description:
      "Ayudamos a choferes que corren cargas en New Jersey a mantenerse más organizados y mejor negociados.",
  },
  {
    title: "Apoyo para Rutas de Connecticut",
    description:
      "Si tus rutas tocan Connecticut, buscamos cargas más consistentes y una planificación más práctica.",
  },
  {
    title: "Apoyo para Rutas de Pennsylvania",
    description:
      "Apoyamos cargas de Pennsylvania con mejor planificación, mejor selección de cargas y más consistencia operativa.",
  },
];

const pricingOptions = [
  {
    title: "10% por carga",
    description:
      "Ideal si prefieres pagar en función del trabajo que se mueve y mantener el costo alineado con tus cargas.",
  },
  {
    title: "$500 al mes",
    description:
      "Ideal si quieres una tarifa mensual fija para tu operación y prefieres trabajar con un costo claro cada mes.",
  },
];

const faqs = [
  {
    question:
      "¿Con qué tipo de choferes trabaja iDispatchLoads.com en NY, NJ, CT y PA?",
    answer:
      "Nos enfocamos en choferes, dueños-operadores y pequeñas flotillas que trabajan desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania. El mejor fit es alguien que quiere cargas más consistentes y menos tiempo perdido hablando con brokers.",
  },
  {
    question: "¿Solo trabajan rutas del noreste?",
    answer:
      "Nuestro enfoque principal es el corredor del noreste porque ahí queremos construir el mejor fit. Si tu operación trabaja regularmente NY, NJ, CT y PA, es exactamente el tipo de operación que queremos apoyar.",
  },
  {
    question: "¿Cómo me ayuda este servicio de dispatch a ahorrar tiempo?",
    answer:
      "Nos encargamos de buscar cargas, hablar con brokers, negociar tarifas y organizar el dispatch para que tú no pases el día entero persiguiendo la próxima carga.",
  },
  {
    question: "¿De verdad me pueden ayudar a conseguir mejores tarifas?",
    answer:
      "Sí. Una parte clave del servicio es negociar pensando en tu ingreso y en las rutas que de verdad te convienen, no en aceptar cualquier carga barata.",
  },
  {
    question: "¿Qué información necesito para empezar?",
    answer:
      "Para calificar rápido necesitamos tu nombre, teléfono, correo, tipo de camión o tráiler y las rutas que prefieres correr en el noreste. Eso nos ayuda a saber si tu operación encaja bien.",
  },
  {
    question: "¿Cuánto cobra iDispatchLoads.com?",
    answer:
      "Trabajamos con dos opciones simples: 10% por carga o $500 al mes. La mejor opción depende de cómo prefieras manejar el costo de dispatch en tu operación.",
  },
];

export default function Home() {
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
        "Servicios de dispatch para choferes y dueños-operadores que trabajan desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania.",
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
        audienceType: "Choferes, dueños-operadores y pequeñas flotillas",
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

      <SectionShell id="servicios" tone="light">
        <SectionHeading
          eyebrow="Servicios"
          title="Dispatch en español para choferes que de verdad mueven el noreste."
          description="Si trabajas en NY, NJ, CT y PA y todavía estás perdiendo horas revisando load boards y llamando brokers, estás perdiendo tiempo y dejando dinero sobre la mesa."
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

      <SectionShell id="beneficios" tone="dark">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Beneficios
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Más manejo. Menos llamadas. Mejores cargas.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Nuestro servicio está pensado para choferes que quieren proteger
              su tiempo, mejorar sus números y mantenerse con cargas más
              constantes dentro del corredor del noreste.
            </p>
          </div>
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="text-sm font-semibold text-cyan-300">
                  0{index + 1}
                </div>
                <p className="mt-2 text-lg leading-8 text-slate-100">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="como-funciona" tone="light">
        <SectionHeading
          eyebrow="Cómo Funciona"
          title="Tres pasos para dejar de cargar con todo tú solo."
          description="Lo mantenemos simple para que los choferes correctos puedan empezar rápido y volver a enfocarse en la carretera."
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
          title="No buscamos cualquier chofer. Buscamos choferes que realmente trabajan el noreste."
          description="Queremos mejor fit, no solo más formularios. Si tú corres por NY, NJ, CT y PA, queremos hablar contigo."
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
                Confianza
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

      <SectionShell id="areas-servicio" tone="light">
        <SectionHeading
          eyebrow="Área de Servicio"
          title="Nuestro enfoque está en New York, New Jersey, Connecticut y Pennsylvania."
          description="Esta página está enfocada en el corredor del noreste porque ahí queremos el mejor fit. Si tu operación toca esos estados con frecuencia, este servicio está hecho para ti."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {serviceAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {area.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {area.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="precios" tone="light">
        <SectionHeading
          eyebrow="Precios"
          title="Precios simples y fáciles de entender."
          description="No trabajamos con estructuras complicadas. Hoy ofrecemos dos maneras simples de cobrar el dispatch para que elijas la que mejor encaja con tu operación."
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
      </SectionShell>

      <SectionShell id="preguntas-frecuentes" tone="brand">
        <SectionHeading
          eyebrow="Preguntas Frecuentes"
          title="Lo que normalmente preguntan los choferes antes de empezar."
          description="Las buenas landing pages aclaran las dudas más importantes antes del primer contacto. Estas son algunas de las preguntas más comunes."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {faq.question}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="contacto" tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Contacto"
              title="¿Corres NY, NJ, CT o PA y necesitas ayuda con dispatch?"
              description="Cuéntanos qué equipo manejas y qué rutas trabajas. Te mostramos cómo ahorrar tiempo, mejorar tarifas y mantenerte más cargado en la zona donde realmente trabajas."
              align="left"
            />
            <div className="mt-8 grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Menos estrés con brokers y más enfoque en manejar
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Mejores tarifas en cargas del corredor del noreste
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Más consistencia en tus cargas de NY, NJ, CT y PA
              </div>
            </div>
          </div>

          <ContactForm
            buttonLabel="Consigue Dispatcher Hoy"
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
                "Cuéntanos cómo trabajas, dónde sales y cómo corres las rutas de NY, NJ, CT y PA.",
            }}
          />
        </div>
      </SectionShell>
    </>
  );
}
