import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Building, Book, FlaskConical, ExternalLink, Instagram, Linkedin, Github, Briefcase, Bookmark, BookOpen, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { UserProfile, Publication, ResearchProject, PortfolioItem, Course, StudentProject } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CommentsSection } from '@/components/CommentsSection';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SaveButton({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const canSave = currentUser?.role === 'student';
  const isSaved = (currentUser?.savedItemIds ?? []).includes(itemId);

  const saveMutation = useMutation({
    mutationFn: () => isSaved ?
      api.delete(`/api/users/me/save/${itemId}`) :
      api.post(`/api/users/me/save/${itemId}`),
    onSuccess: (updatedProfile: UserProfile) => {
      toast.success(isSaved ? 'Item unsaved!' : 'Item saved for later!');
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  if (!canSave) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => saveMutation.mutate()}
      disabled={saveMutation.isPending}
    >
      <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-primary text-primary")} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}

function PortfolioPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-40 w-full mt-12" />
      <Skeleton className="h-10 w-1/3 mt-12" />
      <Skeleton className="h-24 w-full mt-6" />
      <Skeleton className="h-24 w-full mt-4" />
    </div>
  );
}

export function PortfolioPage() {
  const { id, username } = useParams<{ id: string; username: string }>();

  const { data: user, isLoading: isLoadingUser } = useQuery<UserProfile>({
    queryKey: ['user', id || username],
    queryFn: () => {
      if (username) {
        return api.get(`/api/users/username/${username}`);
      }
      return api.get(`/api/users/${id}`);
    },
    enabled: !!id || !!username
  });

  const { data: publications, isLoading: isLoadingPubs } = useQuery<Publication[]>({
    queryKey: ['publications'],
    queryFn: () => api.get('/api/publications')
  });

  const { data: projects, isLoading: isLoadingProjs } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/research')
  });

  const { data: portfolioItems, isLoading: isLoadingPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio')
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['courses', user?.id],
    queryFn: () => api.get(`/api/courses?lecturerId=${user?.id}`),
    enabled: !!user?.id
  });

  const { data: studentProjects, isLoading: isLoadingStudentProjects } = useQuery<StudentProject[]>({
    queryKey: ['student-projects', user?.id],
    queryFn: () => api.get(`/api/student-projects?lecturerId=${user?.id}`),
    enabled: !!user?.id
  });

  const isLoading = isLoadingUser || isLoadingPubs || isLoadingProjs || isLoadingPortfolio || isLoadingCourses || isLoadingStudentProjects;

  if (isLoading) {
    return <PublicLayout><PortfolioPageSkeleton /></PublicLayout>;
  }

  if (!user) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">The profile you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/directory">Back to Directory</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const userPublications = publications?.filter((p) => user.publicationIds?.includes(p.id)) ?? [];
  const userProjects = projects?.filter((p) => user.projectIds?.includes(p.id)) ?? [];
  const userPortfolioItems = portfolioItems?.filter((p) => user.portfolioItemIds?.includes(p.id)) ?? [];
  const userCourses = courses ?? [];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 space-y-12">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={user.photoUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-foreground">{user.name}</h1>
              <p className="text-xl text-primary mt-1">{user.title}</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>{user.department}, {user.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">{user.email}</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">{spec}</Badge>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                {user.socialLinks?.instagram && (
                  <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Biography */}
          <Card>
            <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p></CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="publications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Publications ({userPublications.length})
              </TabsTrigger>
              <TabsTrigger
                value="research"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Research ({userProjects.length})
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Portfolio ({userPortfolioItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Courses ({userCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publications" className="mt-6">
              <div className="space-y-4">
                {userPublications.map((pub) => (
                  <Card key={pub.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {pub.thumbnailUrl ? (
                            <img src={pub.thumbnailUrl} alt={pub.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Book className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-semibold text-lg flex-grow">{pub.title}</h3>
                            <div className="flex-shrink-0"><SaveButton itemId={pub.id} /></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{pub.authors.join(', ')}</p>
                          <p className="text-sm text-muted-foreground mt-1"><em>{pub.journal}</em>, {pub.year}</p>
                          {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">View Publication <ExternalLink className="h-4 w-4" /></a>}
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={pub.id} postOwnerId={user.id} />
                  </Card>
                ))}
                {userPublications.length === 0 && <p className="text-muted-foreground text-center py-8">No publications found.</p>}
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-6">
              <div className="space-y-4">
                {userProjects.map((proj) => (
                  <Card key={proj.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {proj.thumbnailUrl ? (
                            <img src={proj.thumbnailUrl} alt={proj.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <FlaskConical className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-semibold text-lg flex-grow">{proj.title}</h3>
                            <div className="flex-shrink-0"><SaveButton itemId={proj.id} /></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1"><strong>Role:</strong> {proj.role} ({proj.year})</p>
                          <p className="text-sm text-muted-foreground mt-2">{proj.description}</p>
                          {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">Learn More <ExternalLink className="h-4 w-4" /></a>}
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={proj.id} postOwnerId={user.id} />
                  </Card>
                ))}
                {userProjects.length === 0 && <p className="text-muted-foreground text-center py-8">No research projects found.</p>}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <div className="space-y-4">
                {userPortfolioItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Briefcase className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                            <div className="flex-shrink-0"><SaveButton itemId={item.id} /></div>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-sm text-muted-foreground">{item.year} &middot; <Badge variant="outline" className="ml-1">{item.category}</Badge></p>
                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">View Details <ExternalLink className="h-4 w-4" /></a>}
                          </div>
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={item.id} postOwnerId={user.id} />
                  </Card>
                ))}
                {userPortfolioItems.length === 0 && <p className="text-muted-foreground text-center py-8">No portfolio items found.</p>}
              </div>
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <div className="space-y-6">
                {userCourses.map((course) => {
                  const courseProjects = studentProjects?.filter(p => p.courseId === course.id) ?? [];
                  return (
                    <Card key={course.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <h3 className="text-xl font-semibold">{course.title}</h3>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{course.code}</p>
                            <p className="text-sm text-muted-foreground">Semester {course.semester} - {course.year}</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6 border-b pb-6">
                          {course.description}
                        </p>

                        <div>
                          <h4 className="font-semibold mb-4">Student Projects:</h4>
                          {courseProjects.length > 0 ? (
                            <div className="space-y-4">
                              {courseProjects.map(project => (
                                <div key={project.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card/50">
                                  {project.thumbnailUrl && (
                                    <div className="w-32 sm:w-48 flex-shrink-0">
                                      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden border">
                                        <img src={project.thumbnailUrl} alt={project.title} className="object-cover w-full h-full" />
                                      </AspectRatio>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <h5 className="font-semibold text-foreground text-lg">{project.title}</h5>
                                      <span className="text-xs text-muted-foreground">({course.year || new Date().getFullYear()})</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>by {project.students.join(', ')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{project.description}</p>
                                    {project.url && (
                                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-3">
                                        View Project <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No student projects available.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {userCourses.length === 0 && <p className="text-muted-foreground text-center py-8">No courses found.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
}