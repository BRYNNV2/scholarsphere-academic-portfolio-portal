import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
import { usePageTitle } from '@/hooks/usePageTitle';
export function ResearchPage() {
  usePageTitle('Research Projects | ScholarSphere');
  return (
    <AcademicWorkDirectory
      pageTitle="Explore Research Projects"
      pageDescription="Discover ongoing and completed research from leading academic minds."
      searchPlaceholder="Search by title, description, or researcher..."
      apiEndpoint="/api/research"
      queryKey="research"
    />
  );
}