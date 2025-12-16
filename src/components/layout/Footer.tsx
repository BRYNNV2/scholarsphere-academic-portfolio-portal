import { Link } from 'react-router-dom';
import { BookOpenCheck, Github, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/40 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <BookOpenCheck className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg">ScholarSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary">{t('common.home')}</Link></li>
              <li><Link to="/directory" className="text-sm text-muted-foreground hover:text-primary">{t('common.directory')}</Link></li>
              <li><Link to="/publications" className="text-sm text-muted-foreground hover:text-primary">{t('common.publications')}</Link></li>
              <li><Link to="/projects" className="text-sm text-muted-foreground hover:text-primary">{t('common.projects')}</Link></li>
              <li><Link to="/portfolio" className="text-sm text-muted-foreground hover:text-primary">{t('common.portfolio')}</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">{t('common.dashboard')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li><Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.connect')}</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/BRYNNV2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
              <a href="https://www.instagram.com/mhmddfebry_/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/in/mhmdd-bryy-ab4a03280/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}