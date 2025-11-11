import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_LECTURERS, MOCK_PUBLICATIONS, MOCK_PROJECTS } from '@shared/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Building, Book, FlaskConical, ExternalLink } from 'lucide-react';
export function PortfolioPage() {
  const { id } = useParams();
  const lecturer = MOCK_LECTURERS.find(l => l.id === id);
  if (!lecturer) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">Lecturer not found</h1>
          <p className="text-muted-foreground mt-2">The profile you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/directory">Back to Directory</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }
  const publications = MOCK_PUBLICATIONS.filter(p => lecturer.publicationIds.includes(p.id));
  const projects = MOCK_PROJECTS.filter(p => lecturer.projectIds.includes(p.id));
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={lecturer.photoUrl} alt={lecturer.name} />
              <AvatarFallback className="text-4xl">{lecturer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-foreground">{lecturer.name}</h1>
              <p className="text-xl text-primary mt-1">{lecturer.title}</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>{lecturer.department}, {lecturer.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${lecturer.email}`} className="hover:text-primary">{lecturer.email}</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {lecturer.specializations.map(spec => (
                  <Badge key={spec} variant="secondary">{spec}</Badge>
                ))}
              </div>
            </div>
          </div>
          {/* Bio */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{lecturer.bio}</p>
              </CardContent>
            </Card>
          </div>
          {/* Publications */}
          <div className="mt-12">
            <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><Book /> Publications</h2>
            <div className="mt-6 space-y-4">
              {publications.map(pub => (
                <Card key={pub.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg">{pub.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pub.authors.join(', ')}</p>
                    <p className="text-sm text-muted-foreground mt-1"><em>{pub.journal}</em>, {pub.year}</p>
                    {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">View Publication <ExternalLink className="h-4 w-4" /></a>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Research Projects */}
          <div className="mt-12">
            <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><FlaskConical /> Research Projects</h2>
            <div className="mt-6 space-y-4">
              {projects.map(proj => (
                <Card key={proj.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg">{proj.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1"><strong>Role:</strong> {proj.role} ({proj.year})</p>
                    <p className="text-sm text-muted-foreground mt-2">{proj.description}</p>
                    {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">Learn More <ExternalLink className="h-4 w-4" /></a>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}