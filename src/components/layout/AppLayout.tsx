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
function AppLayoutContent({ children, container, className, contentClassName }: AppLayoutProps) {
  const { isMobile } = useSidebar();
  return (
    <>
      {isMobile ? (
        <div className="absolute left-2 top-2 z-20">
          <SidebarTrigger>
            <AppSidebar />
          </SidebarTrigger>
        </div>
      ) : (
        <>
          <AppSidebar />
          <div className="absolute left-2 top-2 z-20">
            <SidebarTrigger />
          </div>
        </>
      )}
      <SidebarInset className={className}>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
            {children}
          </div>
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
      <AppLayoutContent container={container} className={className} contentClassName={contentClassName}>
        {children}
      </AppLayoutContent>
    </SidebarProvider>
  );
}