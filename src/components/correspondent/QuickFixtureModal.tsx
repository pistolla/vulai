import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { League, Group, Stage, Participant, Match } from '@/models';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createMatch, createStage, createGroup } from '@/store/correspondentThunk';
import { setMatches, setStages, setGroups } from '@/store/slices/correspondentSlice';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { toISO } from '@/utils/csvHelpers';

interface QuickFixtureModalProps {
    isOpen: boolean;
    onClose: () => void;
    league: League | null;
}

export const QuickFixtureModal: React.FC<QuickFixtureModalProps> = ({ isOpen, onClose, league }) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(toISO());
    const [venue, setVenue] = useState('');
    const [stageName, setStageName] = useState('Regular Season');
    const [participants, setParticipants] = useState<Participant[]>([
        { refType: 'team', refId: 'Team A', name: 'Team A', score: 0 },
        { refType: 'team', refId: 'Team B', name: 'Team B', score: 0 }
    ]);

    if (!league) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (participants.length < 2) return alert('At least 2 participants required');

        setLoading(true);
        try {
            // 1. Identify or create group
            let groupId = '_general';
            if (league.hasGroups) {
                const groups = await firebaseLeagueService.listGroups(league.id!);
                if (groups.length > 0) {
                    groupId = groups[0].id!;
                } else {
                    groupId = await firebaseLeagueService.createGroup(league.id!, { name: 'Default Group' });
                    const updatedGroups = await firebaseLeagueService.listGroups(league.id!);
                    dispatch(setGroups({ leagueId: league.id!, groups: updatedGroups }));
                }
            }

            // 2. Identify or create stage
            const stages = await firebaseLeagueService.listStages(league.id!, groupId);
            let stageId = '';
            const existingStage = stages.find(s => s.name === stageName);

            if (existingStage) {
                stageId = existingStage.id!;
            } else {
                stageId = await firebaseLeagueService.createStage(league.id!, groupId, {
                    name: stageName,
                    type: 'knockout',
                    order: stages.length + 1
                });
                const updatedStages = await firebaseLeagueService.listStages(league.id!, groupId);
                dispatch(setStages({ leagueId: league.id!, groupId, stages: updatedStages }));
            }

            // 3. Create match
            const match: Omit<Match, 'id'> = {
                matchNumber: 1, // Will be updated by service/thunk if needed
                date,
                venue,
                status: 'pending',
                participants
            };

            await dispatch(createMatch({ leagueId: league.id!, groupId, stageId, match }));

            // Refresh matches
            const updatedMatches = await firebaseLeagueService.listMatches(league.id!, groupId, stageId);
            dispatch(setMatches({ leagueId: league.id!, groupId, stageId, matches: updatedMatches }));

            alert('Match created successfully!');
            onClose();
        } catch (error) {
            console.error('Quick fixture failed:', error);
            alert('Failed to create fixture');
        } finally {
            setLoading(false);
        }
    };

    const updateParticipant = (index: number, name: string) => {
        const p = [...participants];
        p[index] = { ...p[index], name, refId: name };
        setParticipants(p);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Quick Fixture" fullScreen={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Stage Name</label>
                        <input
                            value={stageName}
                            onChange={e => setStageName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 dark:text-white font-bold"
                            placeholder="e.g. Finals"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Venue</label>
                        <input
                            value={venue}
                            onChange={e => setVenue(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 dark:text-white font-bold"
                            placeholder="Stadium name"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Date & Time</label>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 dark:text-white font-bold"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Opponents</label>
                    <div className="flex items-center gap-4">
                        <input
                            value={participants[0].name}
                            onChange={e => updateParticipant(0, e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 dark:text-white font-bold"
                            placeholder="Team 1"
                        />
                        <span className="font-black text-gray-400">VS</span>
                        <input
                            value={participants[1].name}
                            onChange={e => updateParticipant(1, e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-4 focus:ring-blue-500/20 dark:text-white font-bold"
                            placeholder="Team 2"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
                >
                    {loading ? 'Processing...' : 'Create Match Immediately'}
                </button>
            </form>
        </Modal>
    );
};
