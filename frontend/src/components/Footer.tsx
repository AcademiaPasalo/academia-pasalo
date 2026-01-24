import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

const footerLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Metodología", href: "#nosotros" },
  { label: "Modalidad", href: "#modalidades" },
  { label: "Cursos", href: "#cursos" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
  { label: "Plataforma", href: "/plataforma" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-stroke-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-[60px] py-8 lg:py-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-20">
          {/* Brand Section */}
          <div className="flex flex-col gap-3.5 lg:gap-6">
					<Link href="/" className="flex-shrink-0">
						<Image
							src="/foundations/brand-assets/imagotipo.svg"
							alt="Pásalo logo"
							width={120}
							height={162}
							className="object-contain w-[80px] h-[108px] lg:w-[120px] lg:h-[162px]"
						/>
					</Link>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
              Academia especializada en nivelación y reforzamiento para
              estudiantes de la PUCP. Tu éxito es nuestra misión.
            </p>
          </div>

          {/* Enlaces Section */}
          <div className="flex flex-col gap-3.5 lg:gap-[18px]">
            <h3 className="text-base lg:text-lg font-bold text-primary">
              Enlaces
            </h3>
            <div className="flex flex-col gap-3 lg:gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm lg:text-base text-gray-600 hover:text-deep-blue-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto Section */}
          <div className="flex flex-col gap-3.5 lg:gap-[18px]">
            <h3 className="text-base lg:text-lg font-bold text-primary">
              Contacto
            </h3>
            <div className="flex flex-col gap-3 lg:gap-4">
                <div className="flex items-center gap-1 lg:gap-2 group">
                <FaWhatsapp className="text-[20px] lg:text-[24px] text-gray-600 group-hover:text-accent-secondary transition-colors" />
                <a 
                  href="https://wa.me/51903006775"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm lg:text-base text-gray-600 group-hover:text-accent-secondary transition-colors whitespace-nowrap"
                >
                  +51 903 006 775
                </a>
                </div>
              <div className="flex items-center gap-1 lg:gap-2 group">
                <span className="material-symbols-outlined text-[20px] lg:text-[24px] text-gray-600 group-hover:text-accent-secondary transition-colors">
                  mail
                </span>
                <a
                  href="mailto:info@pasaloacademia.pe"
                  className="text-sm lg:text-base text-gray-600 group-hover:text-accent-secondary transition-colors whitespace-nowrap"
                >
                  info@pasaloacademia.pe
                </a>
              </div>
            </div>
          </div>

          {/* Horario Section */}
          <div className="flex flex-col gap-3.5 lg:gap-[18px]">
            <h3 className="text-base lg:text-lg font-bold text-primary">
              Horario de Atención
            </h3>
            <div className="flex flex-col gap-3 lg:gap-4">
              <p className="text-sm lg:text-base text-gray-600">
                Lunes a viernes: 8:00 – 22:00
              </p>
              <p className="text-sm lg:text-base text-gray-600">
                Sábado: 8:00 – 20:00
              </p>
              <p className="text-sm lg:text-base text-gray-600">
                Domingo: 8:00 – 18:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
