import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
import { usePageTitle } from '@/hooks/usePageTitle';
export function PortfolioDirectoryPage() {
  usePageTitle('Portfolio Directory | ScholarSphere');
  return (
    <AcademicWorkDirectory
      pageTitle="Explore Portfolios"
      pageDescription="Discover awards, grants, and other professional activities from our community."
      searchPlaceholder="Search by title, category, or researcher..."
      apiEndpoint="/api/portfolio"
      queryKey="portfolio"
    />
  );
}