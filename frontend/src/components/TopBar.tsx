"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MobileSidebar from "./MobileSidebar";

const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Modalidades", href: "/#modalidades" },
  { label: "Cursos", href: "/#cursos" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Contacto", href: "/#contacto" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("inicio");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determinar si estamos en la página principal
  const isLandingPage = pathname === "/" || pathname === "/landing";
  
  // Solo mostrar sección activa si estamos en la landing page
  const displayActiveSection = isLandingPage ? activeSection : "";

  return (
    <header className="w-full bg-white border-b border-stroke-primary sticky top-0 z-50">
      <div className="mx-auto p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/foundations/brand-assets/isotipo.svg"
              alt="Pásalo logo"
              width={62}
              height={60}
              className="object-contain"
            />
          </Link>

          {/* Navigation Items - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveSection(item.label.toLowerCase())}
                className="group relative flex items-center px-2 py-1"
              >
                <span
                  className={`text-base transition-colors ${
                    displayActiveSection === item.label.toLowerCase()
                      ? "text-accent-primary font-medium"
                      : "text-tertiary hover:text-accent-secondary"
                  }`}
                >
                  {item.label}
                </span>
                {displayActiveSection === item.label.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-main rounded-full mx-2" />
                )}
              </Link>
            ))}

            {/* Botón Plataforma */}
            <Link
              href="/plataforma"
              className="flex items-center gap-2 px-6 py-4 bg-deep-blue-700 text-white rounded-lg font-medium text-base hover:bg-accent-solid-hover transition-colors"
            >
              <span className="material-icons-round text-xl">
                login
              </span>
              Plataforma
            </Link>
          </nav>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-6">
            {/* Botón Plataforma */}
            <Link
              href="/plataforma"
              className="lg:hidden flex items-center gap-2 px-6 py-4 bg-deep-blue-700 text-white rounded-lg font-medium text-base hover:bg-accent-solid-hover transition-colors"
            >
              <span className="material-icons-round text-xl">
                login
              </span>
              Plataforma
            </Link>

            {/* Menu Sidebar */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-tertiary hover:text-accent-primary transition-colors"
              aria-label="Abrir menú"
            >
              <span className="material-icons-round text-4xl">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={displayActiveSection}
        onSectionChange={setActiveSection}
      />
    </header>
  );
}
