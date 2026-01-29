'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Breadcrumb, { type BreadcrumbItem } from '@/components/dashboard/Breadcrumb';

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  actions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  breadcrumbItems,
  title,
  actions,
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Proteger la ruta
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/plataforma');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-deep-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName1 || ''}`.trim();

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-[240px] transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            {/* Left Side - Mobile Menu + Breadcrumb/Title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <span className="material-symbols-outlined text-gray-700 text-[24px]">
                  menu
                </span>
              </button>

              {/* Breadcrumb/Title */}
              <div className="flex-1 min-w-0">
                {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
                {title && !breadcrumbItems && (
                  <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                    {title}
                  </h1>
                )}
              </div>
            </div>

            {/* Right Side - User Profile */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notifications */}
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notificaciones"
              >
                <span className="material-symbols-outlined text-gray-600 text-[20px] lg:text-[22px]">
                  notifications
                </span>
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                  <p className="text-xs text-gray-500">
                    {user.roles[0]?.code === 'STUDENT' ? 'Alumno' : user.roles[0]?.name}
                  </p>
                </div>
                <div className="relative">
                  {user.profilePhotoUrl ? (
                    <Image
                      src={user.profilePhotoUrl}
                      alt={fullName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover lg:w-10 lg:h-10"
                    />
                  ) : (
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-deep-blue-100 flex items-center justify-center">
                      <span className="text-deep-blue-700 font-semibold text-sm">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              {actions}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
