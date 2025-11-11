import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
export function Header() {
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
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="relative top-0 right-0" />
            <Button asChild>
              <Link to="/dashboard">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}