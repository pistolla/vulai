import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function CookiesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Layout title="Cookie Policy" description="Cookie policy for Uni Limelight Sports">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {mounted ? new Date().toLocaleDateString() : ''}
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Cookies are small text files that are stored on your computer or mobile device
                  when you visit our website.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies to improve your browsing experience, analyze site traffic,
                  and personalize content.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                  <li>Essential cookies for website functionality</li>
                  <li>Analytics cookies to understand user behavior</li>
                  <li>Preference cookies to remember your settings</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
                <p className="text-gray-700 mb-4">
                  You can control and manage cookies through your browser settings.
                  Please note that disabling cookies may affect the functionality of our website.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about our use of cookies, please contact us at
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