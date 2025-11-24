import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, User, BookCopy, FlaskConical, BookOpenCheck, Globe, LogOut, Settings, Briefcase, ShieldQuestion, MessageSquareWarning, FileText, GraduationCap } from "lucide-react";
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
              <SidebarMenuButton isActive={isActive("/dashboard")} onClick={() => navigate('/dashboard')}>
                <Home /> <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("/dashboard/profile")} onClick={() => navigate('/dashboard/profile')}>
                <User /> <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {user?.role === 'lecturer' && (
          <SidebarGroup>
            <SidebarGroupHeader>Portfolio Management</SidebarGroupHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/publications")} onClick={() => navigate('/dashboard/publications')}>
                  <BookCopy /> <span>Publications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/research")} onClick={() => navigate('/dashboard/research')}>
                  <FlaskConical /> <span>Research</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/portfolio")} onClick={() => navigate('/dashboard/portfolio')}>
                  <Briefcase /> <span>Portfolio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/courses")} onClick={() => navigate('/dashboard/courses')}>
                  <GraduationCap /> <span>Courses</span>
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
                <SidebarMenuButton isActive={isActive("/dashboard/support")} onClick={() => navigate('/dashboard/support')}>
                  <ShieldQuestion /> <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/report-problem")} onClick={() => navigate('/dashboard/report-problem')}>
                  <MessageSquareWarning /> <span>Report a Problem</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard/terms-and-policies")} onClick={() => navigate('/dashboard/terms-and-policies')}>
                  <FileText /> <span>Terms & Policies</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupHeader>Account</SidebarGroupHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive("/dashboard/settings")} onClick={() => navigate('/dashboard/settings')}>
                <Settings /> <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/')}>
                <Globe /> <span>Homepage</span>
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