import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
import { usePageTitle } from '@/hooks/usePageTitle';
export function PublicationsPage() {
  usePageTitle('Publications | ScholarSphere');
  return (
    <AcademicWorkDirectory
      pageTitle="Browse Publications"
      pageDescription="Explore the latest research and articles from our distinguished academics."
      searchPlaceholder="Search by title, author, or journal..."
      apiEndpoint="/api/publications"
      queryKey="publications"
    />
  );
}