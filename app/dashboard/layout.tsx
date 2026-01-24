'use client';

import ClientSidebar from '@/components/client/ClientSidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { clsx } from 'clsx';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <ClientSidebar />
      <main
        className={clsx(
          'transition-all duration-300 min-h-screen',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
        >
        <div className="bg-gray-50 min-h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

