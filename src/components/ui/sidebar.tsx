import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
type SidebarContextProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}
const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
type SidebarProviderProps = {
  children: React.ReactNode
  defaultOpen?: boolean
}
function SidebarProvider({ children, defaultOpen = false }: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  React.useEffect(() => {
    if (!isMobile) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [isMobile])
  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}
const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, isMobile } = useSidebar()
    if (isMobile) {
      return (
        <div
          ref={ref}
          className={cn("fixed-none relative h-full w-full", className)}
          {...props}
        />
      )
    }
    return (
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cn(
          "fixed left-0 top-0 z-20 h-screen w-60 transition-all duration-300 ease-in-out",
          !open && "-translate-x-full",
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-16 items-center border-b border-sidebar-border px-4", className)}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[calc(100vh-4rem)] flex-col bg-sidebar p-4 text-sidebar-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarContent.displayName = "SidebarContent"
const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  }
)
SidebarGroup.displayName = "SidebarGroup"
const SidebarGroupHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-2 pb-1 pt-2 text-xs font-medium uppercase text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarGroupHeader.displayName = "SidebarGroupHeader";
const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    return <ul ref={ref} className={cn("flex flex-col", className)} {...props} />
  }
)
SidebarMenu.displayName = "SidebarMenu"
const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => {
    return <li ref={ref} className={cn("list-none", className)} {...props} />
  }
)
SidebarMenuItem.displayName = "SidebarMenuItem"
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      className={cn("h-9 w-full justify-start gap-2 px-2", className)}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"
const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, isMobile } = useSidebar()
    if (isMobile) {
      return <div ref={ref} className={cn("transition-all duration-300 ease-in-out", className)} {...props} />
    }
    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-in-out",
          open ? "ml-60" : "ml-0",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = "SidebarInset"
const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, isMobile } = useSidebar()
    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button ref={ref} variant="ghost" size="icon" className={cn(className)} {...props}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            {children}
          </SheetContent>
        </Sheet>
      )
    }
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <Menu />
      </Button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"
export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
}