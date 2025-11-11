import { Link } from 'react-router-dom';
import { BookOpenCheck, Github, Twitter, Linkedin } from 'lucide-react';
export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <BookOpenCheck className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg">ScholarSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              An elegant, modern, and scalable web platform for academics.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link to="/directory" className="text-sm text-muted-foreground hover:text-primary">Directory</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ScholarSphere. Built with ❤️ at Cloudflare.</p>
        </div>
      </div>
    </footer>
  );
}