import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Layout title="Privacy Policy" description="Privacy policy for Uni Limelight Sports">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {mounted ? new Date().toLocaleDateString() : ''}
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account,
                  use our services, or contact us for support.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to provide, maintain, and improve our services,
                  process transactions, and communicate with you.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  without your consent, except as described in this policy.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate security measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at
                  privacy@unisports.live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}