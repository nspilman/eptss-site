import React from 'react';
import { Text } from "@eptss/ui";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-primary">Terms of Service</h1>
      <section className="space-y-6">
        <Text size="base" color="secondary">
          Effective date: April 16, 2025
        </Text>
        <Text size="base" color="secondary">
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using our website and services. By accessing or using our services, you agree to be bound by these Terms.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">1. Acceptance of Terms</h2>
        <Text size="base" color="secondary">
          By using our website or services, you agree to comply with and be legally bound by these Terms. If you do not agree to these Terms, please do not use our services.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">2. Description of Service</h2>
        <Text size="base" color="secondary">
          Our service provides a platform for users to participate in and manage rounds, submissions, and related activities. Features may change or be updated at any time.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">3. User Responsibilities</h2>
        <ul className="list-disc ml-6">
          <li>Provide accurate and complete information when registering or using the service.</li>
          <li>Maintain the security of your account credentials.</li>
          <li>Comply with all applicable laws and regulations.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">4. Prohibited Conduct</h2>
        <ul className="list-disc ml-6">
          <li>Do not use the service for any unlawful or fraudulent purpose.</li>
          <li>Do not attempt to gain unauthorized access to the service or its systems.</li>
          <li>Do not interfere with or disrupt the integrity or performance of the service.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">5. Intellectual Property</h2>
        <Text size="base" color="secondary">
          All content, trademarks, and data on this site are the property of their respective owners. You may not use, copy, or distribute any content without permission.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">6. Disclaimer and Limitation of Liability</h2>
        <Text size="base" color="secondary">
          The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We disclaim all warranties and are not liable for any damages arising from your use of the service.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">7. Changes to Terms</h2>
        <Text size="base" color="secondary">
          We may update these Terms from time to time. Changes will be posted on this page with an updated effective date. Continued use of the service constitutes acceptance of the revised Terms.
        </Text>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">8. Contact</h2>
        <Text size="base" color="secondary">
          If you have any questions about these Terms, please contact us at <a href="mailto:nate.spilman+eptss@gmail.com" className="text-link underline">nate.spilman+eptss@gmail.com</a>.
        </Text>
      </section>
    </main>
  );
}
