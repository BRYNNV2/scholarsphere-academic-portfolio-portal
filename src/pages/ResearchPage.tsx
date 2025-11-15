import { AcademicWorkDirectory } from '@/components/AcademicWorkDirectory';
export function ResearchPage() {
  return (
    <AcademicWorkDirectory
      pageTitle="Explore Research Projects"
      pageDescription="Discover ongoing and completed research from leading academic minds."
      searchPlaceholder="Search by title, description, or researcher..."
      apiEndpoint="/api/research"
      queryKey="projects"
    />
  );
}