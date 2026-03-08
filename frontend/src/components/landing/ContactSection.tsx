"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    course: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
  };

  return (
    <section id="contacto" className="scroll-mt-20 px-4 py-10 md:px-16 lg:px-28 md:py-20 flex flex-col lg:flex-row gap-6">
      {/* Left column - Contact info */}
      <div className="flex-1 flex flex-col lg:items-start gap-6 md:gap-8">
        <div className="flex flex-col items-center lg:items-start gap-1 md:gap-4">
          <h3 className="text-magenta-violet-600 text-lg md:text-2xl font-semibold md:font-bold leading-5 md:leading-7 text-center lg:text-left">
            CONTÁCTANOS
          </h3>
          <h2 className="text-text-primary text-3xl md:text-5xl font-bold leading-8 md:leading-[56px] text-center lg:text-left">
            ¿Listo para potenciar tu rendimiento?
          </h2>
        </div>

        {/* Contact methods */}
        <div className="flex flex-col items-start gap-2 md:gap-3">
          {/* Email */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-bg-info-primary-light rounded-full flex items-center">
              <div className="md:hidden">
                <Icon name="mail" size={16} variant="outlined" className="text-icon-info-primary" />
              </div>
              <div className="hidden md:block">
                <Icon name="mail" size={36} variant="outlined" className="text-icon-info-primary" />
              </div>
            </div>
            <span className="text-text-secondary text-base md:text-2xl font-normal leading-5 md:leading-7">
              info@pasaloacademia.pe
            </span>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-bg-success-light rounded-full flex items-center">
              {/* Mobile WhatsApp icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="md:hidden"
              >
                <path
                  d="M18 3C9.716 3 3 9.716 3 18c0 2.654.69 5.216 2.003 7.488L3 33l7.763-2.035A14.943 14.943 0 0018 33c8.284 0 15-6.716 15-15S26.284 3 18 3zm0 27.5a12.44 12.44 0 01-6.347-1.736l-.455-.27-4.717 1.237 1.258-4.595-.297-.472A12.44 12.44 0 015.5 18c0-6.904 5.596-12.5 12.5-12.5S30.5 11.096 30.5 18 24.904 30.5 18 30.5zm6.862-9.346c-.376-.188-2.226-1.098-2.571-1.224-.346-.125-.597-.188-.849.188-.25.376-.973 1.224-1.192 1.474-.22.25-.44.282-.815.094-.376-.188-1.587-.585-3.023-1.865-1.118-.996-1.872-2.226-2.092-2.602-.22-.376-.024-.579.165-.766.17-.17.376-.44.564-.66.188-.22.25-.376.376-.627.125-.25.063-.47-.032-.66-.094-.188-.849-2.046-1.163-2.802-.306-.735-.617-.636-.849-.648l-.722-.012c-.25 0-.66.094-1.004.47-.346.376-1.318 1.287-1.318 3.14 0 1.852 1.35 3.642 1.538 3.892.188.25 2.656 4.054 6.436 5.685.9.388 1.601.62 2.148.794.903.287 1.724.246 2.374.15.724-.108 2.226-.91 2.54-1.789.314-.878.314-1.63.22-1.789-.094-.156-.346-.25-.722-.44z"
                  className="fill-bg-success-solid"
                />
              </svg>
              {/* Desktop WhatsApp icon */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hidden md:block"
              >
                <path
                  d="M18 3C9.716 3 3 9.716 3 18c0 2.654.69 5.216 2.003 7.488L3 33l7.763-2.035A14.943 14.943 0 0018 33c8.284 0 15-6.716 15-15S26.284 3 18 3zm0 27.5a12.44 12.44 0 01-6.347-1.736l-.455-.27-4.717 1.237 1.258-4.595-.297-.472A12.44 12.44 0 015.5 18c0-6.904 5.596-12.5 12.5-12.5S30.5 11.096 30.5 18 24.904 30.5 18 30.5zm6.862-9.346c-.376-.188-2.226-1.098-2.571-1.224-.346-.125-.597-.188-.849.188-.25.376-.973 1.224-1.192 1.474-.22.25-.44.282-.815.094-.376-.188-1.587-.585-3.023-1.865-1.118-.996-1.872-2.226-2.092-2.602-.22-.376-.024-.579.165-.766.17-.17.376-.44.564-.66.188-.22.25-.376.376-.627.125-.25.063-.47-.032-.66-.094-.188-.849-2.046-1.163-2.802-.306-.735-.617-.636-.849-.648l-.722-.012c-.25 0-.66.094-1.004.47-.346.376-1.318 1.287-1.318 3.14 0 1.852 1.35 3.642 1.538 3.892.188.25 2.656 4.054 6.436 5.685.9.388 1.601.62 2.148.794.903.287 1.724.246 2.374.15.724-.108 2.226-.91 2.54-1.789.314-.878.314-1.63.22-1.789-.094-.156-.346-.25-.722-.44z"
                  className="fill-bg-success-solid"
                />
              </svg>
            </div>
            <span className="text-text-secondary text-base md:text-2xl font-normal leading-5 md:leading-7">
              +51 903 006 775
            </span>
          </div>
        </div>

        {/* Social media */}
        <div className="flex flex-col items-center lg:items-start gap-2 md:gap-3">
          <span className="text-text-secondary text-xl font-medium leading-6">
            SÍGUENOS EN NUESTRAS REDES
          </span>
          <div className="flex items-center gap-2">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61571421159980"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 md:p-3 rounded-full outline outline-2 outline-offset-[-2px] outline-stroke-primary flex items-center hover:bg-bg-secondary transition-colors"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32 16C32 7.163 24.837 0 16 0S0 7.163 0 16c0 7.986 5.851 14.605 13.5 15.806V20.625H9.437V16H13.5v-3.525c0-4.01 2.389-6.225 6.043-6.225 1.75 0 3.582.312 3.582.312V10.5h-2.018c-1.988 0-2.607 1.233-2.607 2.498V16h4.437l-.71 4.625H18.5v11.181C26.149 30.605 32 23.986 32 16z"
                  className="fill-icon-secondary"
                />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/academia.pasalo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 md:p-3 rounded-full outline outline-2 outline-offset-[-2px] outline-stroke-primary flex items-center hover:bg-bg-secondary transition-colors"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 0c-4.347 0-4.89.018-6.597.096C7.7.175 6.537.444 5.52.84a7.844 7.844 0 00-2.834 1.845A7.844 7.844 0 00.84 5.52C.444 6.537.175 7.7.096 9.403.018 11.11 0 11.653 0 16s.018 4.89.096 6.597c.079 1.703.348 2.866.744 3.884a7.844 7.844 0 001.845 2.834A7.844 7.844 0 005.52 31.16c1.017.396 2.181.665 3.884.744C11.11 31.982 11.653 32 16 32s4.89-.018 6.597-.096c1.703-.079 2.866-.348 3.884-.744a7.844 7.844 0 002.834-1.845 7.844 7.844 0 001.845-2.834c.396-1.018.665-2.181.744-3.884C31.982 20.89 32 20.347 32 16s-.018-4.89-.096-6.597c-.079-1.703-.348-2.866-.744-3.884a7.844 7.844 0 00-1.845-2.834A7.844 7.844 0 0026.48.84C25.463.444 24.3.175 22.597.096 20.89.018 20.347 0 16 0zm0 2.883c4.272 0 4.778.016 6.465.093 1.56.071 2.407.332 2.971.551.747.29 1.28.637 1.84 1.197.56.56.907 1.093 1.197 1.84.219.564.48 1.411.551 2.971.077 1.687.093 2.193.093 6.465s-.016 4.778-.093 6.465c-.071 1.56-.332 2.407-.551 2.971a4.954 4.954 0 01-1.197 1.84 4.954 4.954 0 01-1.84 1.197c-.564.219-1.411.48-2.971.551-1.687.077-2.193.093-6.465.093s-4.778-.016-6.465-.093c-1.56-.071-2.407-.332-2.971-.551a4.954 4.954 0 01-1.84-1.197 4.954 4.954 0 01-1.197-1.84c-.219-.564-.48-1.411-.551-2.971-.077-1.687-.093-2.193-.093-6.465s.016-4.778.093-6.465c.071-1.56.332-2.407.551-2.971.29-.747.637-1.28 1.197-1.84.56-.56 1.093-.907 1.84-1.197.564-.219 1.411-.48 2.971-.551 1.687-.077 2.193-.093 6.465-.093zm0 4.903a8.214 8.214 0 100 16.428 8.214 8.214 0 000-16.428zm0 13.545a5.331 5.331 0 110-10.662 5.331 5.331 0 010 10.662zm10.45-13.872a1.92 1.92 0 11-3.84 0 1.92 1.92 0 013.84 0z"
                  className="fill-icon-secondary"
                />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/academia-p%C3%A1salo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 md:p-3 rounded-full outline outline-2 outline-offset-[-2px] outline-stroke-primary flex items-center hover:bg-bg-secondary transition-colors"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M29.631 0H2.369A2.369 2.369 0 000 2.369v27.263A2.369 2.369 0 002.369 32h27.263A2.369 2.369 0 0032 29.631V2.369A2.369 2.369 0 0029.631 0zM9.493 27.263H4.737V11.996h4.756v15.267zM7.115 9.928a2.753 2.753 0 110-5.506 2.753 2.753 0 010 5.506zM27.269 27.263h-4.756v-7.425c0-1.771-.036-4.049-2.468-4.049-2.47 0-2.848 1.929-2.848 3.922v7.552h-4.756V11.996h4.564v2.082h.064c.636-1.203 2.187-2.468 4.5-2.468 4.814 0 5.7 3.168 5.7 7.289v8.364z"
                  className="fill-icon-secondary"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Right column - Contact form */}
      <div className="flex-1 p-6 md:p-8 bg-bg-primary rounded-3xl shadow-[4px_8px_4px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-stroke-secondary flex flex-col gap-5 md:gap-6">
        <h3 className="text-text-primary text-xl md:text-3xl font-semibold md:font-bold leading-6 md:leading-8">
          Déjanos tus datos
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 md:gap-4"
        >
          <input
            type="text"
            placeholder="Nombre Completo"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="h-12 px-3 py-3.5 bg-bg-primary rounded outline outline-1 outline-offset-[-1px] outline-stroke-primary text-text-primary text-base font-normal leading-4 placeholder:text-text-tertiary focus:outline-stroke-accent-primary focus:outline-2"
          />
          <input
            type="tel"
            placeholder="Número de Celular"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="h-12 px-3 py-3.5 bg-bg-primary rounded outline outline-1 outline-offset-[-1px] outline-stroke-primary text-text-primary text-base font-normal leading-4 placeholder:text-text-tertiary focus:outline-stroke-accent-primary focus:outline-2"
          />
          <div className="relative">
            <select
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              className="w-full h-12 px-3 py-3.5 bg-bg-primary rounded outline outline-1 outline-offset-[-1px] outline-stroke-primary text-text-primary text-base font-normal leading-4 appearance-none cursor-pointer focus:outline-stroke-accent-primary focus:outline-2"
            >
              <option value="" disabled className="text-text-tertiary">
                Curso de Interés
              </option>
              <option value="fucal">Fundamentos de Cálculo</option>
              <option value="amga">Álgebra Matricial y Geometría Analítica</option>
              <option value="fufis">Fundamentos de Física</option>
              <option value="quim1">Química 1</option>
              <option value="caldif">Cálculo Diferencial</option>
              <option value="fa1">Física 1</option>
              <option value="fa2">Física 2</option>
              <option value="funpro">Fundamentos de Programación</option>
            </select>
            <Icon
              name="keyboard_arrow_down"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-tertiary pointer-events-none"
            />
          </div>
        </form>

        <p className="text-text-tertiary text-xs md:text-sm font-normal leading-4">
          Al enviar este formulario, usted acepta recibir comunicaciones de
          nuestra parte y comprende que su información de contacto se
          almacenará con nosotros.
        </p>

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full md:self-end md:w-auto px-6 py-3.5 bg-bg-accent-primary-solid rounded-lg flex justify-center items-center gap-2 hover:bg-deep-blue-700 transition-colors cursor-pointer"
        >
          <Icon name="send" size={20} className="text-icon-white" />
          <span className="text-text-white text-base font-medium leading-4">
            Enviar
          </span>
        </button>
      </div>
    </section>
  );
}
