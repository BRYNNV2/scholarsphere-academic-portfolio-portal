import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
export function PublicationsPage() {
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