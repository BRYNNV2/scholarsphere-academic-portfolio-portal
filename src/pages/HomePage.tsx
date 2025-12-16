import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ArrowRight, BookCopy, Globe, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfile } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { getProfileUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const { t } = useTranslation();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['public', 'users'],
    queryFn: () => api.get<UserProfile[]>('/api/users')
  });

  const featuredLecturers = users.filter((u) => u.role === 'lecturer');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="py-24 md:py-32 lg:py-40 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
              {t('home.heroTitle')} <span className="text-primary">{t('home.heroTitleHighlight')}</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t('home.heroDescription')}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/directory">{t('home.exploreDirectory')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>{t('common.getStarted')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-foreground">{t('home.whyTitle')}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              {t('home.whySubtitle')}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.1 }}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BookCopy className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{t('home.feature1Title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {t('home.feature1Desc')}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.2 }}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{t('home.feature2Title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {t('home.feature2Desc')}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.3 }}>
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{t('home.feature3Title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {t('home.feature3Desc')}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Lecturers */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-foreground">{t('home.featuredLecturers')}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              {t('home.featuredLecturersDesc')}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden text-center">
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-1" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                    <Skeleton className="h-9 w-24 mx-auto mt-4" />
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredLecturers.map((lecturer, index) => (
                <motion.div key={lecturer.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden text-center transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={lecturer.photoUrl} alt={lecturer.name} />
                        <AvatarFallback>{lecturer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold text-foreground">{lecturer.name}</h3>
                      <p className="text-sm text-primary">{lecturer.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lecturer.university}</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link to={getProfileUrl(lecturer)}>{t('common.viewProfile')}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
            {error && <p className="text-center text-destructive col-span-full">{error.message}</p>}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {(!user || user.role !== 'student') && (
        <div className="bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">{t('home.ctaTitle')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                {t('home.ctaDesc')}
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>{t('home.createPortfolio')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}