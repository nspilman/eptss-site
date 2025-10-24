import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-primary">Privacy Policy</h1>
      <section className="space-y-6 text-base text-secondary">
        <p>
          Effective date: April 16, 2025
        </p>
        <p>
          This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services, including when you sign in with Google OAuth.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Information We Collect</h2>
        <ul className="list-disc ml-6">
          <li>
            <span className="font-semibold">Google Account Information:</span> When you sign in with Google, we may collect your name, email address, and profile picture as provided by Google.
          </li>
          <li>
            <span className="font-semibold">Usage Data:</span> We may collect information about how you use our services to improve functionality and user experience.
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">How We Use Your Information</h2>
        <ul className="list-disc ml-6">
          <li>To provide, operate, and maintain our services</li>
          <li>To authenticate your identity via Google OAuth</li>
          <li>To improve and personalize your experience</li>
          <li>To communicate with you about updates or support</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share your data with trusted third-party service providers only as necessary to operate our services (such as Google for authentication), or if required by law.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Data Security</h2>
        <p>
          We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is completely secure.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Your Rights</h2>
        <p>
          You may request access to or deletion of your personal information by contacting us. We will comply with applicable laws regarding your rights.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-primary">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:nate.spilman+eptss@gmail.com" className="text-link underline">nate.spilman+eptss@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
