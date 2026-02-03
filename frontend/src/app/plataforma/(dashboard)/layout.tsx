'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BreadcrumbProvider, useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { breadcrumbItems } = useBreadcrumb();

  return (
    <DashboardLayout
      breadcrumbItems={breadcrumbItems.length > 0 ? breadcrumbItems : undefined}
      showSidebar={true}
      showTopBar={true}
      showBreadcrumb={true}
      showToggle={true}
    >
      <div className='max-w-7xl mx-auto'>{children}</div>
    </DashboardLayout>
  );
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
