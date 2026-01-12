"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import UserHeader from '@/components/UserHeader';
import { auth, db } from '@/services/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { FiMail, FiLock } from 'react-icons/fi';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


export default function PendingApprovalPage() {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [gmail, setGmail] = useState(user?.email || '');
  const [phone, setPhone] = useState<string | undefined>();
  const [password, setPassword] = useState('');
  const [hasReadDocument, setHasReadDocument] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleDocumentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) { // Close to bottom
      setHasReadDocument(true);
    }
  };

  const handleConsentSubmit = async () => {
    if (!agreeToTerms) return;
    setLoading(true);
    try {
      const consentData = {
        correspondentId: user!.uid,
        correspondentName: user!.displayName || '',
        gmailAccount: gmail,
        phoneNumber: phone,
        agreedAt: new Date().toISOString(),
        documentVersion: '1.0',
      };
      await updateDoc(doc(db, 'users', user!.uid), {
        consentSigned: true,
        consentData,
      });
      // Simulate sending email
      alert(`Consent document signed and sent to ${gmail}`);
      setSuccess('Consent signed successfully! Your correspondent account is now active.');
      // Perhaps redirect to dashboard
      setTimeout(() => router.push('/correspondent'), 2000);
    } catch (err: any) {
      setError('Failed to sign consent: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!auth.currentUser) throw new Error('Not authenticated');

      if (!validateGmail(gmail)) {
        throw new Error('Please enter a valid Gmail address (ending with @gmail.com)');
      }

      if (!phone || !isValidPhoneNumber(phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update email if changed
      if (gmail !== user?.email) {
        await updateEmail(auth.currentUser, gmail);
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user!.uid), {
        email: gmail,
        phone: phone,
      });
      setSuccess('Gmail account linked successfully! Proceeding to consent agreement...');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'correspondent') {
      router.replace('/'); // or appropriate page
      return;
    }

    if (user.status === 'active') {
      router.replace('/correspondent');
      return;
    }

    // If correspondent and pending, show alert
    alert('Your correspondent account is pending verification. Please complete the setup process.');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <UserHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl rounded-[3rem] border border-gray-100/50 dark:border-gray-800/50 p-8 shadow-2xl shadow-black/5">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <div className={`w-16 h-1 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            </div>
            {step === 1 && (
              <>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Link Your Gmail Account</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  To import data from Google Drive, you need to link a Gmail account with 2FA enabled. This account will be used to access your Drive files.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Why Gmail with 2FA?</h3>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                    <li>• Secure access to your Google Drive files</li>
                    <li>• Two-factor authentication ensures account security</li>
                    <li>• Direct integration with our data import system</li>
                    <li>• Required for correspondent data submission workflow</li>
                  </ul>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Correspondent Consent Agreement</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please read the full consent document below and agree to the terms to complete your correspondent registration.
                </p>
              </>
            )}
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gmail Account <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.name@gmail.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be a Gmail account with 2FA enabled for security
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="KE"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your phone number with country code
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Linking Account...' : 'Link Gmail Account'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto" onScroll={handleDocumentScroll}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Correspondent Consent Agreement</h2>

                <div className="prose dark:prose-invert max-w-none text-sm space-y-4">
                  <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>

                  <h3 className="text-lg font-semibold">1. Agreement to Serve as Correspondent</h3>
                  <p>I, {user?.displayName || 'the undersigned'}, hereby agree to serve as a Correspondent for {user?.universityId ? 'my university' : 'the assigned university'} and associated sports teams within the Unill Sports Network platform.</p>

                  <h3 className="text-lg font-semibold">2. Responsibilities and Duties</h3>
                  <p>As a Correspondent, I understand and accept the following responsibilities:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accurately report and upload sports-related data, including team rosters, match results, player statistics, and other relevant information.</li>
                    <li>Ensure the timeliness and accuracy of all data submissions to the platform.</li>
                    <li>Maintain the confidentiality and security of sensitive information related to teams, players, and university data.</li>
                    <li>Comply with all applicable laws, regulations, and university policies regarding data privacy and sports reporting.</li>
                    <li>Use the provided Google Drive integration responsibly and only for authorized data uploads.</li>
                  </ul>

                  <h3 className="text-lg font-semibold">3. Data Accuracy and Integrity</h3>
                  <p>I acknowledge that the accuracy and integrity of the data I upload is critical to the platform's functionality and the trust of its users. I agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Verify all data for accuracy before submission.</li>
                    <li>Report any discrepancies or errors immediately upon discovery.</li>
                    <li>Correct any inaccuracies in previously submitted data as soon as possible.</li>
                    <li>Maintain detailed records of data sources and verification processes.</li>
                  </ul>

                  <h3 className="text-lg font-semibold">4. Terms and Regulations Compliance</h3>
                  <p>I agree to abide by all terms and regulations set forth by the Unill Sports Network, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The platform's Terms of Service and Privacy Policy.</li>
                    <li>University-specific guidelines for sports data reporting.</li>
                    <li>General data protection regulations (e.g., GDPR, CCPA) and privacy laws.</li>
                    <li>Ethical standards for sports journalism and reporting.</li>
                  </ul>

                  <h3 className="text-lg font-semibold">5. Google Drive Integration</h3>
                  <p>By linking my Gmail account, I authorize the Unill Sports Network to access files from my Google Drive for the purpose of data import. I understand that:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Only files explicitly shared for import will be accessed.</li>
                    <li>My Google Drive data remains under my control and ownership.</li>
                    <li>I am responsible for ensuring the security of my Google account.</li>
                  </ul>

                  <h3 className="text-lg font-semibold">6. Termination and Accountability</h3>
                  <p>I understand that failure to comply with this agreement may result in suspension or termination of my correspondent privileges. I agree to be held accountable for any breaches of this agreement.</p>

                  <h3 className="text-lg font-semibold">7. Amendments</h3>
                  <p>This agreement may be amended by the Unill Sports Network at any time. Continued use of the platform constitutes acceptance of any amendments.</p>

                  <div className="border-t border-gray-300 dark:border-gray-600 pt-6 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Digital Signature</h3>
                    <p><strong>Name:</strong> {user?.displayName || ''}</p>
                    <p><strong>Email:</strong> {gmail}</p>
                    <p><strong>Phone:</strong> {phone}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>IP Address:</strong> [Automatically recorded]</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={!hasReadDocument}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="agree" className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and fully understand the Correspondent Consent Agreement and agree to all terms and conditions outlined above.
                  {!hasReadDocument && <span className="text-red-500 block">Please scroll to the bottom of the document to enable this checkbox.</span>}
                </label>
              </div>

              <button
                onClick={handleConsentSubmit}
                disabled={loading || !agreeToTerms}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Signing Agreement...' : 'Sign and Complete Registration'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 rounded-lg">
              {success}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}