import { NavLink } from 'react-router-dom';
import { Home, BookOpen, FileText, FlaskConical, Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/directory', icon: BookOpen, label: 'Directory' },
        { to: '/publications', icon: FileText, label: 'Pubs' },
        { to: '/projects', icon: FlaskConical, label: 'Projects' },
        { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
        { to: '/courses', icon: GraduationCap, label: 'Courses' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
