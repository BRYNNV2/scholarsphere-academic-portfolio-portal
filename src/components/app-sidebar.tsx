import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, User, BookCopy, FlaskConical, BookOpenCheck, Globe, LogOut, Settings, Briefcase, ShieldQuestion, MessageSquareWarning, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupHeader,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">ScholarSphere</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupHeader>Main</SidebarGroupHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                <NavLink to="/dashboard"><Home /> <span>Dashboard</span></NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
                <NavLink to="/dashboard/profile"><User /> <span>Profile</span></NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {user?.role === 'lecturer' && (
          <SidebarGroup>
            <SidebarGroupHeader>Portfolio Management</SidebarGroupHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/publications")}>
                  <NavLink to="/dashboard/publications"><BookCopy /> <span>Publications</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/research")}>
                  <NavLink to="/dashboard/research"><FlaskConical /> <span>Research</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/portfolio")}>
                  <NavLink to="/dashboard/portfolio"><Briefcase /> <span>Portfolio</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {user?.role === 'student' && (
          <SidebarGroup>
            <SidebarGroupHeader>Support & About</SidebarGroupHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/support")}>
                  <NavLink to="/dashboard/support"><ShieldQuestion /> <span>Support</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/report-problem")}>
                  <NavLink to="/dashboard/report-problem"><MessageSquareWarning /> <span>Report a Problem</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/terms-and-policies")}>
                  <NavLink to="/dashboard/terms-and-policies"><FileText /> <span>Terms & Policies</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup className="mt-auto">
          <SidebarGroupHeader>Account</SidebarGroupHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                <NavLink to="/dashboard/settings"><Settings /> <span>Settings</span></NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/"><Globe /> <span>Homepage</span></NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut /> <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}