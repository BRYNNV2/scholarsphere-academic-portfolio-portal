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
              <NavLink to="/dashboard">
                <SidebarMenuButton isActive={isActive("/dashboard")}>
                  <Home /> <span>Dashboard</span>
                </SidebarMenuButton>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink to="/dashboard/profile">
                <SidebarMenuButton isActive={isActive("/dashboard/profile")}>
                  <User /> <span>Profile</span>
                </SidebarMenuButton>
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {user?.role === 'lecturer' && (
          <SidebarGroup>
            <SidebarGroupHeader>Portfolio Management</SidebarGroupHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/dashboard/publications">
                  <SidebarMenuButton isActive={isActive("/dashboard/publications")}>
                    <BookCopy /> <span>Publications</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/dashboard/research">
                  <SidebarMenuButton isActive={isActive("/dashboard/research")}>
                    <FlaskConical /> <span>Research</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/dashboard/portfolio">
                  <SidebarMenuButton isActive={isActive("/dashboard/portfolio")}>
                    <Briefcase /> <span>Portfolio</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {user?.role === 'student' && (
          <SidebarGroup>
            <SidebarGroupHeader>Support & About</SidebarGroupHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/dashboard/support">
                  <SidebarMenuButton isActive={isActive("/dashboard/support")}>
                    <ShieldQuestion /> <span>Support</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/dashboard/report-problem">
                  <SidebarMenuButton isActive={isActive("/dashboard/report-problem")}>
                    <MessageSquareWarning /> <span>Report a Problem</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <NavLink to="/dashboard/terms-and-policies">
                  <SidebarMenuButton isActive={isActive("/dashboard/terms-and-policies")}>
                    <FileText /> <span>Terms & Policies</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup className="mt-auto">
          <SidebarGroupHeader>Account</SidebarGroupHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink to="/dashboard/settings">
                <SidebarMenuButton isActive={isActive("/dashboard/settings")}>
                  <Settings /> <span>Settings</span>
                </SidebarMenuButton>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink to="/">
                <SidebarMenuButton>
                  <Globe /> <span>Homepage</span>
                </SidebarMenuButton>
              </NavLink>
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