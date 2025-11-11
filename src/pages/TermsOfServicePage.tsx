import { PublicLayout } from '@/components/layout/PublicLayout';
export function TermsOfServicePage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <article className="prose dark:prose-invert max-w-none">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="text-2xl font-display font-bold mt-12 mb-4">1. Introduction</h2>
            <p>Welcome to ScholarSphere ("we", "our", "us"). These Terms of Service govern your use of our website. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">2. Accounts</h2>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">3. Content</h2>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">4. Intellectual Property</h2>
            <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of ScholarSphere and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">6. Limitation Of Liability</h2>
            <p>In no event shall ScholarSphere, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">7. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}