import Icon from "@/components/ui/Icon";

interface Testimonial {
  name: string;
  initials: string;
  avatarColor: string;
  career: string;
  stars: number;
  quote: string;
  course: string;
  timeAgo: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Jorge Méndez",
    initials: "JM",
    avatarColor: "bg-bg-info-primary-solid",
    career: "Ingeniería Informática",
    stars: 4,
    quote:
      "Entré a la academia con mucho miedo a Física 1, pero las asesorías me dieron la confianza que necesitaba. No solo aprobé, entendí todo. El material es A1.",
    course: "Física 1",
    timeAgo: "Hace 1 mes",
  },
  {
    name: "Camila Rodríguez",
    initials: "CR",
    avatarColor: "bg-bg-accent-primary-solid",
    career: "Ingeniería Industrial",
    stars: 5,
    quote:
      "Gracias a Pásalo pude aprobar Fundamentos de Cálculo con una nota excelente. La metodología es súper práctica. ¡Recomendado!",
    course: "Fundamentos de Cálculo",
    timeAgo: "Hace 3 semanas",
  },
  {
    name: "Fernanda Diaz",
    initials: "FD",
    avatarColor: "bg-bg-warning-solid",
    career: "Derecho",
    stars: 5,
    quote:
      "Los repasos intensivos antes de los exámenes son lo mejor. Te dan las fijas. Me salvó el ciclo completamente.",
    course: "Argumentación",
    timeAgo: "Hace 1 semana",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          size={20}
          className={i < count ? "text-bg-rating-solid" : "text-icon-disabled"}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="scroll-mt-20 px-4 py-10 md:px-16 lg:px-28 md:py-20 bg-bg-primary flex flex-col items-center gap-6 md:gap-10">
      {/* Header */}
      <div className="w-full flex flex-col items-center gap-4 px-5">
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <span className="px-3 py-1 md:px-4 md:py-2 bg-bg-accent-light rounded-full text-text-accent-primary text-xs md:text-sm font-medium leading-3 md:leading-4">
            RESULTADOS COMPROBADOS
          </span>
          <h2 className="w-full text-center text-text-primary text-3xl md:text-5xl font-bold leading-8 md:leading-[56px]">
            Historias de Éxito
          </h2>
        </div>
        <div className="w-full lg:px-60">
          <p className="text-center text-text-secondary text-xs md:text-xl font-normal leading-4 md:leading-6">
            Nuestros alumnos comparten su experiencia logrando sus metas
            académicas con nuestro método especializado.
          </p>
        </div>
      </div>

      {/* Testimonial cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="h-52 md:h-60 p-5 relative bg-bg-primary rounded-lg card-shadow outline outline-1 outline-offset-[-1px] outline-stroke-secondary flex flex-col gap-2"
          >
            {/* Header: avatar + info + stars */}
            <div className="flex flex-col gap-1 md:gap-2">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 ${t.avatarColor} rounded-full flex justify-center items-center`}
                >
                  <span className="text-text-white text-sm md:text-base font-medium leading-4 md:leading-5">
                    {t.initials}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-text-primary text-sm md:text-lg font-semibold leading-4 md:leading-5 line-clamp-1">
                    {t.name}
                  </span>
                  <span className="text-magenta-violet-600 text-xs md:text-sm font-medium leading-4 line-clamp-1">
                    {t.career}
                  </span>
                </div>
              </div>
              <StarRating count={t.stars} />
            </div>

            {/* Quote icon */}
            <div className="absolute right-5 top-4">
              <Icon
                name="format_quote"
                size={48}
                variant="outlined"
                className="text-bg-info-secondary-light-hover"
              />
            </div>

            {/* Quote + footer */}
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-text-secondary text-xs md:text-base font-normal leading-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex justify-between items-center">
                <span className="px-1.5 py-1 bg-bg-quartiary rounded-full text-text-secondary text-[8px] font-medium leading-[10px]">
                  {t.course}
                </span>
                <span className="text-text-tertiary text-xs font-normal leading-4">
                  {t.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
