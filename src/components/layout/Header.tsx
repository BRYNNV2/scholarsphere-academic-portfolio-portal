import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, LayoutDashboard, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function Header() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">ScholarSphere</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/directory" className={navLinkClasses}>
              Directory
            </NavLink>
            <NavLink to="/publications" className={navLinkClasses}>
              Publications
            </NavLink>
            <NavLink to="/projects" className={navLinkClasses}>
              Projects
            </NavLink>
            <NavLink to="/portfolio" className={navLinkClasses}>
              Portfolio
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="relative top-0 right-0" />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoUrl} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile"><User className="mr-2 h-4 w-4" /><span>Profile</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}