import Image from "next/image";
import Icon from "@/components/ui/Icon";

export default function HeroSection() {
  return (
    <section id="inicio" className="scroll-mt-20 relative px-4 py-10 md:px-16 lg:px-28 md:py-20 flex flex-col lg:flex-row justify-center items-center gap-6 md:gap-10 overflow-hidden">
      {/* Decorative ellipses - mobile: simple circles, desktop: PNG assets */}
      <div className="absolute -left-[95px] top-[521px] w-72 h-72 bg-bg-info-secondary-light rounded-full pointer-events-none md:hidden" />
      <div className="absolute left-[155px] -top-[68px] w-72 h-72 bg-bg-accent-light rounded-full pointer-events-none md:hidden" />
      <img
        src="/images/ellipse-info-secondary-light.png"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute -left-[100px] top-[300px] w-[400px] h-[402px] pointer-events-none"
      />
      <img
        src="/images/ellipse-accent-light.png"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute -top-[100px] right-[-100px] lg:right-auto lg:left-[1120px] w-[420px] h-[400px] pointer-events-none"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4 md:gap-8 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[48px] md:leading-tight lg:leading-[64px] text-center lg:text-left tracking-wide">
          <span className="text-text-primary">Asegura tu éxito en la </span>
          <span className="text-text-pucp-solid">PUCP</span>
          <span className="text-text-primary"> y </span>
          <span className="text-text-accent-primary">Pásalo a la Primera</span>
        </h1>

        <p className="text-text-secondary text-base md:text-2xl font-normal leading-5 md:leading-7 text-center lg:text-left">
          Refuerza tus conocimientos con nuestra metodología híbrida, diseñada
          específicamente para los cursos más exigentes de la universidad.
        </p>

        {/* Buttons: stacked on mobile, inline on desktop */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-5">
          <a
            href="#cursos"
            className="px-6 py-3.5 bg-bg-accent-primary-solid rounded-lg flex justify-center items-center gap-2 hover:bg-bg-accent-solid-hover transition-colors"
          >
            <Icon name="school" size={20} className="text-icon-white" />
            <span className="text-text-white text-base font-medium leading-4">
              Ver Cursos
            </span>
          </a>

          <a
            href="#info"
            className="px-6 py-3.5 bg-bg-primary rounded-lg outline outline-1 outline-offset-[-1px] outline-stroke-accent-primary flex justify-center items-center gap-2 hover:bg-bg-secondary transition-colors"
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
          className="w-40 h-56 md:w-64 lg:w-80 md:h-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}
