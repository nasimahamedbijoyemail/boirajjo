import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Terms of Service — Boi Rajjo" description="Terms and conditions for using the Boi Rajjo marketplace platform." path="/terms" />
    <div className="container max-w-3xl py-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Platform Overview</h2>
          <p className="text-muted-foreground leading-relaxed">Boi Rajjo is a cross-border cultural commerce platform that connects readers, students, and institutions across Bangladesh and Europe. We facilitate the buying, selling, and requesting of books and educational materials through our AI-powered marketplace.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">You must be at least 16 years of age to use our platform. By creating an account, you confirm that you meet this requirement and that all information provided is accurate.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>One account per person; shared or duplicate accounts may be terminated</li>
            <li>You must provide accurate institution and contact information</li>
            <li>Account deletion can be requested through your profile settings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Marketplace Rules</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Listings must accurately describe the item's condition, price, and availability</li>
            <li>Prohibited items: counterfeit, pirated, illegal, or hazardous materials</li>
            <li>Pricing must be fair and transparent; no hidden fees</li>
            <li>Sellers are responsible for fulfilling orders as described</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. EU Market Operations</h2>
          <p className="text-muted-foreground leading-relaxed">Products listed under our "Within Europe" section are stocked within our European distribution network. Delivery estimates are indicative and subject to standard logistics variations. Returns within the EU are accepted within 14 days of delivery in accordance with the EU Consumer Rights Directive (2011/83/EU).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">The Boi Rajjo platform, including its design, algorithms, demand forecasting models, and brand identity, is the intellectual property of Boi Rajjo. Users retain ownership of content they create (listings, reviews) but grant us a license to display it on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">Boi Rajjo acts as a marketplace facilitator. We are not a party to transactions between buyers and sellers. While we verify users and monitor listings, we cannot guarantee the quality, safety, or legality of all items listed. Our liability is limited to the maximum extent permitted by applicable EU and national law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Dispute Resolution</h2>
          <p className="text-muted-foreground leading-relaxed">We encourage users to resolve disputes directly. For unresolved issues, our admin team will mediate. For EU consumers, you may also use the EU Online Dispute Resolution platform at <a href="https://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-primary underline">ec.europa.eu/odr</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">These terms are governed by the laws of the European Union and the applicable member state where the user resides. Nothing in these terms affects your statutory rights as a consumer under EU law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about these terms: <strong className="text-foreground">legal@boirajjo.com</strong></p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfService;
