import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Privacy Policy — Boi Rajjo" description="Privacy Policy for Boi Rajjo. GDPR-compliant data handling practices." path="/privacy" />
    <div className="container max-w-3xl py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Data Controller</h2>
          <p className="text-muted-foreground leading-relaxed">Boi Rajjo ("we", "us") operates as the data controller for personal data processed through our platform. We are committed to protecting your privacy in accordance with the General Data Protection Regulation (GDPR - EU 2016/679) and applicable national data protection laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We collect and process the following categories of personal data:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong className="text-foreground">Account Data:</strong> Name, email address, phone number, WhatsApp number</li>
            <li><strong className="text-foreground">Profile Data:</strong> Institution, department, profile photo</li>
            <li><strong className="text-foreground">Transaction Data:</strong> Order history, payment references, delivery addresses</li>
            <li><strong className="text-foreground">Usage Data:</strong> Pages visited, features used, device information</li>
            <li><strong className="text-foreground">Communication Data:</strong> Support requests, feedback, product requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Legal Basis for Processing</h2>
          <p className="text-muted-foreground leading-relaxed">Under GDPR Article 6, we process your data based on:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong className="text-foreground">Contractual necessity (Art. 6(1)(b)):</strong> To provide our marketplace services</li>
            <li><strong className="text-foreground">Consent (Art. 6(1)(a)):</strong> For optional analytics and marketing communications</li>
            <li><strong className="text-foreground">Legitimate interest (Art. 6(1)(f)):</strong> For fraud prevention, platform security, and service improvement</li>
            <li><strong className="text-foreground">Legal obligation (Art. 6(1)(c)):</strong> To comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Your Rights (GDPR Chapter III)</h2>
          <p className="text-muted-foreground leading-relaxed">You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong className="text-foreground">Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
            <li><strong className="text-foreground">Right to Rectification (Art. 16):</strong> Correct inaccurate data via your profile settings</li>
            <li><strong className="text-foreground">Right to Erasure (Art. 17):</strong> Request deletion of your account and data</li>
            <li><strong className="text-foreground">Right to Data Portability (Art. 20):</strong> Receive your data in a machine-readable format</li>
            <li><strong className="text-foreground">Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
            <li><strong className="text-foreground">Right to Restrict Processing (Art. 18):</strong> Limit how we use your data</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">To exercise these rights, use the account deletion feature in your profile or contact us at <strong className="text-foreground">privacy@boirajjo.com</strong>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">We retain personal data only as long as necessary for the purposes outlined above. Account data is deleted within 30 days of an approved deletion request. Transaction records may be retained for up to 7 years for legal compliance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed">Our platform operates across the EU and Bangladesh. Data transfers outside the EEA are protected by Standard Contractual Clauses (SCCs) approved by the European Commission, in compliance with GDPR Chapter V.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">We implement appropriate technical and organizational measures including encryption in transit (TLS), secure authentication, role-based access controls, and regular security assessments to protect your data (GDPR Art. 32).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">We use essential cookies required for platform functionality and optional analytics cookies (with your consent). You can manage cookie preferences at any time through our cookie consent banner. See our cookie categories:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong className="text-foreground">Essential:</strong> Authentication, security, preferences</li>
            <li><strong className="text-foreground">Analytics (optional):</strong> Usage patterns, performance monitoring</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Contact & Supervisory Authority</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy inquiries: <strong className="text-foreground">privacy@boirajjo.com</strong></p>
          <p className="text-muted-foreground leading-relaxed">You have the right to lodge a complaint with your local Data Protection Authority (GDPR Art. 77).</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
