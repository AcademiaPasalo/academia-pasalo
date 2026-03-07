import Image from "next/image";

interface Modality {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  popular?: boolean;
}

const modalities: Modality[] = [
  {
    image: "/images/evaluacion-unica.png",
    title: "Por evaluación única",
    subtitle: "MODALIDAD INDIVIDUAL",
    description:
      "3 clases de 2 horas (teórico/práctico) enfocadas en una evaluación específica con material adjunto y resolución de consultas.",
  },
  {
    image: "/images/ciclo-completo.png",
    title: "Ciclo completo / Medio ciclo",
    subtitle: "MODALIDAD GRUPAL",
    description:
      "Acompañamiento continuo durante todo el ciclo académico con 3 clases por cada evaluación y resolución de dudas.",
    popular: true,
  },
  {
    image: "/images/asesorias-personalizadas.png",
    title: "Asesorías personalizadas",
    subtitle: "MODALIDAD INDIVIDUAL / GRUPAL",
    description:
      "Fecha y hora a tu disposición. Enfoque 100% en tus dudas específicas y ritmo de aprendizaje. Material adjunto post asesoría.",
  },
];

export default function ModalitiesSection() {
  return (
    <section id="modalidades" className="scroll-mt-20 px-4 py-10 md:px-16 lg:px-28 md:py-20 flex flex-col items-center gap-6 md:gap-10">
      {/* Header */}
      <div className="w-full flex flex-col items-center gap-4 px-5">
        <h2 className="w-full text-center text-text-primary text-3xl md:text-5xl font-bold leading-8 md:leading-[56px]">
          Nuestras Modalidades
        </h2>
        <div className="w-full lg:px-60">
          <p className="text-center text-text-secondary text-xs md:text-xl font-normal leading-4 md:leading-6">
            Ofrecemos distintos tipos de asesorías para cada tipo de estudiante.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {modalities.map((mod) => (
          <div
            key={mod.title}
            className={`relative p-5 md:p-8 bg-bg-primary rounded-lg flex flex-col items-center gap-2 md:gap-3 ${
              mod.popular
                ? "outline outline-2 outline-offset-[-2px] outline-stroke-accent-primary"
                : "outline outline-1 outline-offset-[-1px] outline-stroke-secondary"
            }`}
          >
            {mod.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 md:py-0.5 bg-bg-accent-primary-solid rounded-full">
                <span className="text-text-white text-xs font-medium leading-3 md:leading-4 whitespace-nowrap">
                  MÁS POPULAR
                </span>
              </div>
            )}

            <Image
              src={mod.image}
              alt={mod.title}
              width={192}
              height={192}
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />

            <h3 className="w-full text-center text-text-primary text-base md:text-xl font-semibold leading-5 md:leading-6">
              {mod.title}
            </h3>
            <p className="w-full text-center text-text-accent-primary text-xs md:text-sm font-medium md:font-semibold leading-4">
              {mod.subtitle}
            </p>
            <p className="w-full text-center text-text-secondary text-xs md:text-sm font-normal leading-4">
              {mod.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
