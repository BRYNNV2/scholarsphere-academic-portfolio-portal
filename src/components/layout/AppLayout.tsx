import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};

function AppLayoutRenderer({ children, container, className, contentClassName }: AppLayoutProps) {
  const { isMobile } = useSidebar();

  return (
    <>
      <AppSidebar />
      <SidebarInset className={className}>
        <div className="absolute left-2 top-2 z-20">
          <SidebarTrigger variant="ghost" size="icon">
            <Menu />
          </SidebarTrigger>
        </div>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>{children}</div>
        ) : (
          children
        )}
      </SidebarInset>
    </>
  );
}

export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppLayoutRenderer container={container} className={className} contentClassName={contentClassName}>
        {children}
      </AppLayoutRenderer>
    </SidebarProvider>
  );
}
