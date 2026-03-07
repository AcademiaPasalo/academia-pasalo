import Image from "next/image";
import Icon from "@/components/ui/Icon";

export default function HeroSection() {
  return (
    <section id="inicio" className="scroll-mt-20 relative px-6 md:px-16 lg:px-28 py-20 flex flex-col lg:flex-row justify-center items-center gap-10 overflow-hidden">
      {/* Decorative ellipses */}
      <img
        src="/images/ellipse-info-secondary-light.png"
        alt=""
        aria-hidden="true"
        className="absolute -left-[100px] top-[300px] w-[400px] h-[402px] pointer-events-none"
      />
      <img
        src="/images/ellipse-accent-light.png"
        alt=""
        aria-hidden="true"
        className="absolute -top-[100px] right-[-100px] lg:right-auto lg:left-[1120px] w-[420px] h-[400px] pointer-events-none"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col gap-8 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight lg:leading-[64px] tracking-wide">
          <span className="text-text-primary">Asegura tu éxito en la </span>
          <span className="text-text-pucp-solid">PUCP</span>
          <span className="text-text-primary"> y </span>
          <span className="text-text-accent-primary">Pásalo a la Primera</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-2xl font-normal leading-7">
          Refuerza tus conocimientos con nuestra metodología híbrida, diseñada
          específicamente para los cursos más exigentes de la universidad.
        </p>

        <div className="flex flex-wrap gap-5">
          <a
            href="#cursos"
            className="px-6 py-3.5 bg-bg-accent-primary-solid rounded-lg flex items-center gap-2 hover:bg-bg-accent-solid-hover transition-colors"
          >
            <Icon name="school" size={20} className="text-icon-white" />
            <span className="text-text-white text-base font-medium leading-4">
              Ver Cursos
            </span>
          </a>

          <a
            href="#info"
            className="px-6 py-3.5 bg-bg-primary rounded-lg outline outline-1 outline-offset-[-1px] outline-stroke-accent-primary flex items-center gap-2 hover:bg-bg-secondary transition-colors"
          >
            <Icon name="message" size={20} className="text-bg-accent-primary-solid" />
            <span className="text-text-accent-primary text-base font-medium leading-4">
              Más Información
            </span>
          </a>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative z-10 flex-shrink-0">
        <Image
          src="/images/login/login-photo-531b23.png"
          alt="Estudiante de Academia Pásalo"
          width={320}
          height={442}
          className="w-64 md:w-80 h-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}
