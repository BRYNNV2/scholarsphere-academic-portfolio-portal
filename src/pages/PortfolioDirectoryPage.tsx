import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
export function PortfolioDirectoryPage() {
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