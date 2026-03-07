"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";

interface Teacher {
  name: string;
  initials: string;
  avatarColor: string;
  photo?: string;
}

interface Course {
  code: string;
  name: string;
  category: string;
  cycle: string;
  headerColor: string;
  teachers: Teacher[];
  freeClassUrl: string;
}

const courses: Course[] = [
  {
    code: "AMGA",
    name: "Álgebra Matricial y Geometría Analítica",
    category: "CIENCIAS",
    cycle: "1° CICLO",
    headerColor: "#1E40A3",
    teachers: [{ name: "Ana Martínez", initials: "AM", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "FUCAL",
    name: "Fundamentos de Cálculo",
    category: "CIENCIAS",
    cycle: "1° CICLO",
    headerColor: "#F13072",
    teachers: [
      { name: "Luis García", initials: "MM", avatarColor: "bg-bg-info-primary-solid" },
      { name: "María Romero", initials: "MR", avatarColor: "bg-bg-info-primary-solid", photo: "/images/placeholder-avatar.png" },
    ],
    freeClassUrl: "#",
  },
  {
    code: "FUFIS",
    name: "Fundamentos de Física",
    category: "CIENCIAS",
    cycle: "1° CICLO",
    headerColor: "#10B981",
    teachers: [{ name: "Carmen López", initials: "CL", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "QUÍM 1",
    name: "Química 1",
    category: "CIENCIAS",
    cycle: "1° CICLO",
    headerColor: "#3B82F6",
    teachers: [{ name: "Jorge Sánchez", initials: "JS", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "CALDIF",
    name: "Cálculo Diferencial",
    category: "CIENCIAS",
    cycle: "2° CICLO",
    headerColor: "#BE185D",
    teachers: [{ name: "Isabel Díaz", initials: "ID", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "DIBUJO",
    name: "Dibujo en Ingeniería",
    category: "CIENCIAS",
    cycle: "2° CICLO",
    headerColor: "#16E361",
    teachers: [{ name: "Pedro Rodríguez", initials: "PR", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "FA1",
    name: "Física 1",
    category: "CIENCIAS",
    cycle: "2° CICLO",
    headerColor: "#60A5FA",
    teachers: [{ name: "Laura Fernández", initials: "LF", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "CALVAR",
    name: "Cálculo en Varias Variables",
    category: "CIENCIAS",
    cycle: "3° CICLO",
    headerColor: "#E692FF",
    teachers: [{ name: "Miguel Pérez", initials: "MP", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "ED",
    name: "Estructuras Discretas",
    category: "CIENCIAS",
    cycle: "3° CICLO",
    headerColor: "#9333EA",
    teachers: [{ name: "Elena Gómez", initials: "EG", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "FA2",
    name: "Física 2",
    category: "CIENCIAS",
    cycle: "3° CICLO",
    headerColor: "#D97706",
    teachers: [{ name: "Francisco Ruiz", initials: "FR", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "FUNPRO",
    name: "Fundamentos de Programación",
    category: "CIENCIAS",
    cycle: "3° CICLO",
    headerColor: "#EC92C1",
    teachers: [{ name: "Rosa Jiménez", initials: "RJ", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "CALA",
    name: "Cálculo Aplicado",
    category: "CIENCIAS",
    cycle: "4° CICLO",
    headerColor: "#4F46E5",
    teachers: [{ name: "Javier Romero", initials: "JR", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
  {
    code: "FA3",
    name: "Física 3",
    category: "CIENCIAS",
    cycle: "4° CICLO",
    headerColor: "#FBBF24",
    teachers: [{ name: "María García", initials: "MG", avatarColor: "bg-bg-success-solid" }],
    freeClassUrl: "#",
  },
];

const filters = ["Todos", "Ciencias", "Letras", "Facultad"];

function TeacherAvatars({ teachers }: { teachers: Teacher[] }) {
  if (teachers.length === 1) {
    const t = teachers[0];
    return (
      <div className={`w-7 h-7 md:w-8 md:h-8 p-1 ${t.avatarColor} rounded-full flex justify-center items-center`}>
        <span className="text-center text-text-white text-[8px] md:text-[10px] font-medium leading-[10px] md:leading-3">
          {t.initials}
        </span>
      </div>
    );
  }

  return (
    <div className="w-12 h-7 md:w-14 md:h-8 relative">
      <div className={`w-7 h-7 md:w-8 md:h-8 absolute left-0 top-0 ${teachers[0].avatarColor} rounded-full outline outline-[1.5px] md:outline-2 outline-stroke-white flex justify-center items-center p-1`}>
        <span className="text-center text-text-white text-[8px] md:text-[10px] font-medium leading-[10px] md:leading-3">
          {teachers[0].initials}
        </span>
      </div>
      {teachers[1].photo ? (
        <img
          src={teachers[1].photo}
          alt={teachers[1].name}
          className="w-7 h-7 md:w-8 md:h-8 absolute left-6 md:left-7 top-0 rounded-full outline outline-1 outline-black object-cover"
        />
      ) : (
        <div className={`w-7 h-7 md:w-8 md:h-8 absolute left-6 md:left-7 top-0 ${teachers[1].avatarColor} rounded-full outline outline-[1.5px] md:outline-2 outline-stroke-white flex justify-center items-center p-1`}>
          <span className="text-center text-text-white text-[8px] md:text-[10px] font-medium leading-[10px] md:leading-3">
            {teachers[1].initials}
          </span>
        </div>
      )}
    </div>
  );
}

export default function CoursesSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCourses =
    activeFilter === "Todos"
      ? courses
      : courses.filter(
          (c) => c.category.toLowerCase() === activeFilter.toLowerCase()
        );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 288 + 24; // w-72 (288px) + gap-6 (24px)
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  return (
    <section id="cursos" className="scroll-mt-20 px-4 py-10 md:px-16 lg:px-28 md:py-20 relative bg-gradient-to-b from-deep-blue-50 via-white to-muted-indigo-50 flex flex-col items-center gap-6 md:gap-10">
      {/* Header */}
      <div className="w-full flex flex-col items-center gap-4 md:gap-5 px-5">
        <h2 className="w-full text-center text-3xl md:text-5xl font-bold leading-8 md:leading-[56px]">
          <span className="text-text-primary">Nuestros </span>
          <span className="text-text-accent-primary">Cursos</span>
        </h2>

        {/* Filter tags */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium leading-4 transition-colors ${
                activeFilter === filter
                  ? "bg-bg-accent-primary-solid text-text-white"
                  : "bg-bg-primary outline outline-1 outline-offset-[-1px] outline-stroke-accent-primary text-text-accent-primary hover:bg-bg-accent-light"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel with navigation */}
      <div className="w-full flex items-center gap-4">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Anterior"
          className="absolute left-[90px] hidden lg:flex flex-shrink-0 p-3 bg-bg-primary rounded-full card-shadow outline outline-1 outline-offset-[-1px] outline-stroke-primary justify-center items-center hover:bg-bg-secondary transition-colors cursor-pointer"
        >
          <Icon name="chevron_left" size={20} className="text-icon-primary" />
        </button>

        {/* Course cards - scrollable area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth courses-carousel"
          >
            {filteredCourses.map((course) => (
              <div key={course.code} className="w-64 md:w-72 flex-shrink-0">
                <div className="bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary flex flex-col">
                  {/* Color header */}
                  <div
                    className="h-12 md:h-16 rounded-t-2xl"
                    style={{ backgroundColor: course.headerColor }}
                  />

                  {/* Card content */}
                  <div className="h-48 md:h-56 p-4 flex flex-col justify-between">
                    <div className="flex flex-col gap-2.5">
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="px-2 py-1 md:px-2.5 md:py-1.5 bg-bg-success-light rounded-full text-text-success-primary text-[10px] md:text-xs font-medium leading-3">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 md:px-2.5 md:py-1.5 bg-bg-quartiary rounded-full text-text-secondary text-[10px] md:text-xs font-medium leading-3">
                          {course.cycle}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-text-primary text-base md:text-xl font-semibold leading-5 md:leading-6 line-clamp-2">
                        {course.name}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-5">
                      {/* Teacher */}
                      <div className="flex items-center gap-1 md:gap-2">
                        <TeacherAvatars teachers={course.teachers} />
                        <div className="flex-1 flex flex-col gap-0.5">
                          <span className="text-text-tertiary text-[8px] md:text-[10px] font-medium leading-[10px] md:leading-3">
                            ASESOR
                          </span>
                          <span className="text-text-secondary text-xs md:text-base font-normal leading-4 line-clamp-1">
                            {course.teachers.length > 1
                              ? course.teachers.map((t) => t.name).join(" & ")
                              : course.teachers[0].name}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <a
                        href={course.freeClassUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-3 bg-bg-accent-light rounded-lg outline outline-1 outline-offset-[-1px] outline-stroke-accent-secondary flex justify-center items-center gap-1.5 hover:bg-deep-blue-100 transition-colors"
                      >
                        <Icon
                          name="play_arrow"
                          size={16}
                          className="text-icon-accent-primary"
                        />
                        <span className="text-text-accent-primary text-sm font-medium leading-4">
                          Ver Clase Gratis
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Siguiente"
          className="absolute right-[90px] hidden lg:flex flex-shrink-0 p-3 bg-bg-primary rounded-full card-shadow outline outline-1 outline-offset-[-1px] outline-stroke-primary justify-center items-center hover:bg-bg-secondary transition-colors cursor-pointer"
        >
          <Icon name="chevron_right" size={20} className="text-icon-primary" />
        </button>
      </div>
    </section>
  );
}
