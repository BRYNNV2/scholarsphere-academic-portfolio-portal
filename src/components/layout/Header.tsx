import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, LayoutDashboard, LogOut, User, Globe } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

export function Header() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
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
              {t('common.home')}
            </NavLink>
            <NavLink to="/directory" className={navLinkClasses}>
              {t('common.directory')}
            </NavLink>
            <NavLink to="/publications" className={navLinkClasses}>
              {t('common.publications')}
            </NavLink>
            <NavLink to="/projects" className={navLinkClasses}>
              {t('common.projects')}
            </NavLink>
            <NavLink to="/portfolio" className={navLinkClasses}>
              {t('common.portfolio')}
            </NavLink>
            <NavLink to="/courses" className={navLinkClasses}>
              Courses
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12" className="mr-2 rounded-sm shadow-sm">
                    <clipPath id="t">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                    </clipPath>
                    <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
                  </svg>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('id')} className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16" className="mr-2 rounded-sm shadow-sm border border-border">
                    <rect width="3" height="1" fill="#D0021B" />
                    <rect y="1" width="3" height="1" fill="#FFFFFF" />
                  </svg>
                  Indonesia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>{t('common.dashboard')}</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile"><User className="mr-2 h-4 w-4" /><span>{t('common.viewProfile')}</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('common.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t('common.register')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}