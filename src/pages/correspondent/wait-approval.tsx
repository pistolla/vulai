"use client";

import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import UserHeader from '@/components/UserHeader';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { FiClock, FiCheckCircle, FiMail, FiLogOut } from 'react-icons/fi';

export default function WaitApprovalPage() {
    const user = useAppSelector(s => s.auth.user);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }

        if (user.role !== 'correspondent') {
            router.replace('/');
            return;
        }
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
            <UserHeader />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl rounded-[3rem] border border-gray-100/50 dark:border-gray-800/50 p-12 shadow-2xl shadow-black/5 animate-in zoom-in duration-700">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full animate-ping" />
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FiClock className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                        Application Under Review
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                        Thank you, <span className="text-blue-600 dark:text-blue-400 font-bold">{user?.displayName || 'Correspondent'}</span>! Your consent form has been submitted successfully and is currently being reviewed by our administration team.
                    </p>

                    <div className="grid gap-6 text-left mb-10">
                        <div className="flex items-start space-x-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                            <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-green-900 dark:text-green-200">Consent Form Signed</h3>
                                <p className="text-sm text-green-700 dark:text-green-400/80">Your digital signature has been recorded and verified.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                            <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-blue-900 dark:text-blue-200">Processing Details</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400/80">We've sent a confirmation email to {user?.email}. Expect an update within 24-48 hours.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                        >
                            <FiLogOut /> Log Out
                        </button>
                    </div>

                    <p className="mt-10 text-sm text-gray-500 dark:text-gray-500 font-medium">
                        Need urgent assistance? <a href="mailto:support@unillsports.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</a>
                    </p>
                </div>
            </main>
        </div>
    );
}
