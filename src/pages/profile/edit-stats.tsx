"use client";

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { RootState } from '@/store';
import { usePlayerPortfolio } from '@/hooks/usePlayerPortfolio';
import { updatePlayerVitals } from '@/store/playerThunk';
import UserHeader from '@/components/UserHeader';
import FanGuard from '@/guards/FanGuard';
import { FiSave, FiUser, FiActivity, FiAward, FiSettings, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function EditPlayerStatsPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(s => s.auth.user);
    const player = usePlayerPortfolio(user?.uid || '');

    const [formData, setFormData] = useState({
        height: 0,
        weight: 0,
        bodyFat: 0,
        bio: '',
        socialLinks: {
            instagram: '',
            twitter: ''
        }
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (player) {
            setFormData({
                height: player.height || 0,
                weight: player.weight || 0,
                bodyFat: player.bodyFat || 0,
                bio: player.bio || '',
                socialLinks: {
                    instagram: player.socialLinks?.instagram || '',
                    twitter: player.socialLinks?.twitter || ''
                }
            });
        }
    }, [player]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await dispatch(updatePlayerVitals({ playerId: user.uid, data: formData })).unwrap();
            alert('Stats updated successfully!');
        } catch (err) {
            alert('Failed to update stats');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <FanGuard>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
                <UserHeader />

                <main className="max-w-4xl mx-auto px-4 py-12">
                    <Link href="/profile" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-8">
                        <FiArrowLeft className="mr-2" /> Back to Profile
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Performance Lab</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Calibrate your physical vitals and professional bio</p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <FiSave className="w-5 h-5" />}
                            <span>{saving ? 'Syncing...' : 'Save Changes'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            {/* Physical Domain */}
                            <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <FiActivity className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Biometric Data</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest pl-1">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: +e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest pl-1">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: +e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest pl-1">Body Fat (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.bodyFat}
                                            onChange={e => setFormData({ ...formData, bodyFat: +e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Bio Domain */}
                            <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <FiUser className="text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Athlete Bio</h3>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest pl-1">Introduction</label>
                                    <textarea
                                        rows={5}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell your story to the scouts..."
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white resize-none"
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            {/* Status Overview */}
                            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6">Profile Status</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Publicity</span>
                                    <span className="text-sm font-black">ACTIVE</span>
                                </div>
                                <div className="h-1.5 w-full bg-blue-500 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-full" />
                                </div>
                                <p className="mt-4 text-xs font-medium text-blue-100">Your profile is visible to all university scouts and agents.</p>
                            </div>

                            {/* Tips */}
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5">
                                <div className="flex items-center space-x-3 mb-6">
                                    <FiAward className="text-yellow-500" />
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Pro Tips</h4>
                                </div>
                                <ul className="space-y-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-2 shrink-0" />
                                        Keep your weight updated weekly for accurate training logs.
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-2 shrink-0" />
                                        Scouts prefer detailed bios with specific achievements.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </FanGuard>
    );
}
