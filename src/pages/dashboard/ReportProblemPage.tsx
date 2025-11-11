import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
const reportProblemSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters long.'),
  description: z.string().min(20, 'Description must be at least 20 characters long.'),
});
type ReportProblemFormData = z.infer<typeof reportProblemSchema>;
export function ReportProblemPage() {
  const form = useForm<ReportProblemFormData>({
    resolver: zodResolver(reportProblemSchema),
    defaultValues: {
      subject: '',
      description: '',
    },
  });
  const onSubmit = (data: ReportProblemFormData) => {
    console.log('Problem Report Submitted:', data);
    toast.success('Your report has been submitted!', {
      description: 'Thank you for your feedback. We will look into it shortly.',
    });
    form.reset();
  };
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report a Problem</h1>
        <p className="text-muted-foreground">
          Encountered an issue or have feedback? Let us know.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>
            Please provide as much detail as possible so we can assist you effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Unable to upload profile picture" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={8}
                        placeholder="Please describe the issue in detail..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}