"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Modalidades", href: "/#modalidades" },
  { label: "Cursos", href: "/#cursos" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Contacto", href: "/#contacto" },
];

export default function MobileSidebar({
  isOpen,
  onClose,
  activeSection,
  onSectionChange,
}: MobileSidebarProps) {
  // Bloquear scroll cuando el sidebar está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    onClose();
  };

  return (
    <>
      {/* Overlay con opacidad */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar - 300px */}
      <aside
        className={`fixed top-0 right-0 h-full w-[300px] bg-deep-blue-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-label="Menú de navegación móvil"
      >
        {/* Logo Header - padding: 20px 24px */}
        <div className="flex items-center justify-between gap-[10px] px-6 py-5">
          <Image
            src="/foundations/brand-assets/logotipo-white.svg"
            alt="Pásalo logo"
            width={139}
            height={44}
            className="object-contain"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white hover:opacity-80 transition-opacity"
            aria-label="Cerrar menú"
          >
            <span className="material-icons-round text-[28px] leading-none">close</span>
          </button>
        </div>

        {/* Main Content - padding: 20px, rounded bottom-right 16px */}
        <div className="flex-1 flex flex-col items-end p-5 rounded-br-[16px]">
          {/* Navigation Items - gap: 20px */}
          <nav className="flex flex-col w-full gap-5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => handleNavClick(item.label.toLowerCase())}
                className={`flex items-stretch w-full gap-1 px-2 py-2 rounded-lg transition-colors ${activeSection === item.label.toLowerCase()
                  ? "bg-deep-blue-900"
                  : "bg-deep-blue-700 hover:bg-deep-blue-800"
                  }`}
              >
                <span
                  className="flex-1 text-base font-medium leading-[17px] tracking-[-0.18px] text-white"
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Botón Plataforma - Secondary button: padding: 16px 24px, gap: 8px, border 1px */}
            <Link
              href="/plataforma"
              className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-white text-deep-blue-700 border border-deep-blue-700 rounded-lg font-medium text-base leading-[17px] tracking-[-0.18px] hover:bg-gray-50 transition-colors"
            >
              <span className="material-icons-round text-[20px] leading-none">
                login
              </span>
              Plataforma
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}
