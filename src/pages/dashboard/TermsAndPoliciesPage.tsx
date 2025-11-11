import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
export function TermsAndPoliciesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Terms & Policies</h1>
        <p className="text-muted-foreground">
          Review our legal documents and policies.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
          <CardDescription>
            Here you can find links to our Terms of Service and Privacy Policy. These documents govern your use of ScholarSphere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Terms of Service</p>
                <p className="text-sm text-muted-foreground">Rules and guidelines for using our platform.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">
                Read More <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Privacy Policy</p>
                <p className="text-sm text-muted-foreground">How we collect, use, and protect your data.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Read More <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}