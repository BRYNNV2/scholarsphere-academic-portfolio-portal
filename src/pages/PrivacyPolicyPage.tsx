import { PublicLayout } from '@/components/layout/PublicLayout';
export function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <article className="prose dark:prose-invert max-w-none">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="text-2xl font-display font-bold mt-12 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, such as your name, email address, and professional details. We also collect information automatically as you navigate the site, such as usage details and IP addresses.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and provide the features and functionality of the Service, to communicate with you, to monitor and improve our Service, and for other customer service purposes.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">3. Sharing of Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">4. Data Security</h2>
            <p>We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depends on you.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">5. Your Data Rights</h2>
            <p>You may, of course, decline to submit personally identifiable information through the Service, in which case ScholarSphere may not be able to provide certain services to you. You may update or correct your account information at any time by logging in to your account.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">6. Changes to Our Privacy Policy</h2>
            <p>It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Service home page.</p>
            <h2 className="text-2xl font-display font-bold mt-8 mb-4">7. Contact Information</h2>
            <p>To ask questions or comment about this privacy policy and our privacy practices, please contact us.</p>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}