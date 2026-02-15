"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/hooks/useNavigation";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar, {
  type SidebarNavItem,
  type SidebarUser,
} from "@/components/dashboard/Sidebar";
import Breadcrumb, {
  type BreadcrumbItem,
} from "@/components/dashboard/Breadcrumb";
import Icon from "@/components/ui/Icon";
import SecurityWarningBanner from "@/components/dashboard/SecurityWarningBanner";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  // Props opcionales para personalización avanzada
  customNavItems?: SidebarNavItem[];
  customSidebarUser?: SidebarUser;
  showSidebar?: boolean;
  showTopBar?: boolean;
  showBreadcrumb?: boolean;
  showToggle?: boolean;
}

export default function DashboardLayout({
  children,
  breadcrumbItems,
  title,
  customNavItems,
  customSidebarUser,
  showSidebar = true,
  showTopBar = true,
  showBreadcrumb = true,
  showToggle = true,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // lg
    const update = () => setIsDesktop(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/plataforma");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleToggleSidebar = () => {
    if (isDesktop) {
      toggleSidebar(); // colapsa/expande (desktop)
    } else {
      setIsMobileMenuOpen((v) => !v); // abre/cierra drawer (mobile)
    }
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-solid border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !navigation) {
    return null;
  }

  // Usar navegación personalizada o del sistema
  const navItems = customNavItems || navigation.navItems;
  const sidebarUser = customSidebarUser || navigation.sidebarUser;

  // Handler para cerrar mobile menu
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-bg-secondary flex overflow-hidden">
      {/* Sidebar - Desktop */}
      {showSidebar && (
        <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
          <Sidebar
            user={sidebarUser}
            navItems={navItems}
            isCollapsed={isCollapsed}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleCloseMobileMenu}
          aria-label="Cerrar menú"
        ></div>
      )}

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div
          className={`lg:hidden fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-stroke-secondary z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar user={sidebarUser} navItems={navItems} isCollapsed={false} />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col h-screen ${showSidebar ? (isCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]") : ""}`}
      >
        {/* Top Bar */}
        {showTopBar && (
          <header className="h-14 bg-white border-b border-stroke-secondary flex items-center justify-between px-4 flex-shrink-0 z-30">
            {/* Left Side */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Breadcrumb/Title */}
              <div className="flex-1 min-w-0">
                {showBreadcrumb && breadcrumbItems ? (
                  <Breadcrumb
                    items={breadcrumbItems}
                    onToggleSidebar={handleToggleSidebar}
                    showToggle={showToggle && showSidebar}
                    isSidebarOpen={isDesktop ? !isCollapsed : isMobileMenuOpen}
                  />
                ) : title ? (
                  <h1 className="text-lg font-semibold text-primary truncate">
                    {title}
                  </h1>
                ) : null}
              </div>
            </div>

            {/* Right Side */}
            {/*<div className="flex items-center gap-2">
              <TopBar 
                user={topBarUser}
                showNotifications={true}
                notificationCount={3}
                onNotificationClick={onNotificationClick}
                onUserClick={onUserMenuClick}
              />
              {actions}
            </div>*/}
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 bg-bg-secondary overflow-y-auto">
          <SecurityWarningBanner />
          <div className="p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
