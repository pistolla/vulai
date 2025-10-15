import Layout from '../components/Layout';

export default function TermsPage() {
  return (
    <Layout title="Terms of Service" description="Terms of service for Uni Limelight Sports">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Uni Limelight Sports, you accept and agree to be bound by
                  the terms and provision of this agreement.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Use License</h2>
                <p className="text-gray-700 mb-4">
                  Permission is granted to temporarily access the materials on our website for
                  personal, non-commercial transitory viewing only.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">User Responsibilities</h2>
                <p className="text-gray-700 mb-4">
                  Users are responsible for maintaining the confidentiality of their account
                  information and for all activities that occur under their account.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Content Guidelines</h2>
                <p className="text-gray-700 mb-4">
                  Users may not post content that is illegal, harmful, threatening, abusive,
                  harassing, defamatory, vulgar, obscene, or invasive of another's privacy.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  Questions about the Terms of Service should be sent to us at legal@unisports.live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}