import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Register',
    '/directory': 'Directory',
    '/publications': 'Publications',
    '/projects': 'Research Projects',
    '/portfolio': 'Portfolio',
    '/courses': 'Courses',
    '/terms-of-service': 'Terms of Service',
    '/privacy-policy': 'Privacy Policy',
    '/dashboard': 'Dashboard',
    '/dashboard/profile': 'Profile | Dashboard',
    '/dashboard/publications': 'Publications | Dashboard',
    '/dashboard/research': 'Research | Dashboard',
    '/dashboard/portfolio': 'Portfolio | Dashboard',
    '/dashboard/courses': 'Courses | Dashboard',
    '/dashboard/notifications': 'Notifications | Dashboard',
    '/dashboard/settings': 'Settings | Dashboard',
    '/dashboard/support': 'Support | Dashboard',
    '/dashboard/report-problem': 'Report a Problem | Dashboard',
    '/dashboard/terms-and-policies': 'Terms & Policies | Dashboard',
};

export function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'ScholarSphere';

        // Exact match
        if (TITLE_MAP[path]) {
            title = `ScholarSphere | ${TITLE_MAP[path]}`;
        }
        // Dynamic routes
        else if (path.startsWith('/users/') || path.startsWith('/u/')) {
            title = 'ScholarSphere | User Profile';
        } else if (path.startsWith('/work/')) {
            title = 'ScholarSphere | Work Detail';
        }

        document.title = title;
    }, [location]);
}
