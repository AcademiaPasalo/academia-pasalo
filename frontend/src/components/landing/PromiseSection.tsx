import Icon from "@/components/ui/Icon";

interface PromiseCard {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const cards: PromiseCard[] = [
  {
    icon: "videocam",
    iconBg: "bg-warning-light",
    iconColor: "text-orange-600",
    title: "Clases en vivo interactivas",
    description:
      "Olvídate de las grabaciones aburridas. Partimos desde cero para que comprendas cada concepto incluso si no lograste comprenderlo en clase.",
  },
  {
    icon: "question_answer",
    iconBg: "bg-bg-success-light",
    iconColor: "text-bg-success-solid",
    title: "Soporte directo y rápido",
    description:
      "¿Te quedaste con una duda fuera de clase? Contamos con canales de WhatsApp exclusivos para brindarte asistencia académica ágil y personalizada.",
  },
  {
    icon: "phonelink",
    iconBg: "bg-bg-info-primary-light",
    iconColor: "text-bg-info-primary-solid",
    title: "Plataforma integral",
    description:
      "Accede 24/7 desde cualquier dispositivo a las grabaciones de clases, materiales de estudio y solucionarios detallados en nuestra plataforma integral.",
  },
  {
    icon: "groups",
    iconBg: "bg-bg-pucp-light",
    iconColor: "text-bg-pucp-solid",
    title: "Profesores PUCP",
    description:
      "Conocen la malla curricular y los métodos de evaluación de la PUCP, alineando tu preparación con las exigencias académicas de cada curso.",
  },
];

export default function PromiseSection() {
  return (
    <section id="nosotros" className="scroll-mt-20 px-4 py-10 md:px-16 lg:px-28 md:py-20 bg-bg-primary flex flex-col items-center gap-6 md:gap-10">
      {/* Header */}
      <div className="w-full flex flex-col items-center gap-4 px-5">
        <div className="w-full flex flex-col gap-1 md:gap-4">
          <h3 className="text-center text-magenta-violet-600 text-lg md:text-2xl font-semibold md:font-bold leading-5 md:leading-7">
            NUESTRA PROMESA
          </h3>
          <h2 className="text-center text-text-primary text-3xl md:text-5xl font-bold leading-8 md:leading-[56px]">
            Somos estudiantes para estudiantes
          </h2>
        </div>
        <div className="w-full lg:px-60">
          <p className="text-center text-text-secondary text-xs md:text-xl font-normal leading-4 md:leading-6">
            Hemos modernizado la enseñanza universitaria, manteniendo un
            acompañamiento personalizado. Combinamos interacción en vivo,
            soporte ágil, una plataforma integral y el respaldo de profesores
            que conocen exactamente lo que necesitas aprender.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="p-4 bg-bg-primary rounded-lg card-shadow outline outline-1 outline-offset-[-1px] outline-stroke-secondary flex flex-col gap-2 md:gap-3"
          >
            <div
              className={`p-2 ${card.iconBg} rounded-lg inline-flex items-center w-fit`}
            >
              <Icon
                name={card.icon}
                size={24}
                variant="outlined"
                className={card.iconColor}
              />
            </div>
            <h4 className="text-text-primary text-sm md:text-lg font-medium leading-4 md:leading-5">
              {card.title}
            </h4>
            <p className="text-text-secondary text-xs md:text-base font-normal leading-4">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
