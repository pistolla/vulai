import { Fixture, GoalTiming } from "@/models";
import { useState } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { updateFixture } from "@/store/correspondentThunk";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { generateMatchReport } from "@/utils/reportGenerator";
import { useToast } from "@/components/common/ToastProvider";
import { FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface FixtureResultPopupProps {
    fixture: Fixture;
    onClose: () => void;
}

export const FixtureResultPopup: React.FC<FixtureResultPopupProps> = ({ fixture, onClose }) => {
    const dispatch = useAppDispatch();
    const { success, error: showError, info, warning } = useToast();
    const [score, setScore] = useState({
        home: fixture.score?.home || 0,
        away: fixture.score?.away || 0
    });
    const [pointsAdded, setPointsAdded] = useState({
        home: fixture.pointsAdded?.home || 0,
        away: fixture.pointsAdded?.away || 0
    });
    const [pointsDeducted, setPointsDeducted] = useState({
        home: fixture.pointsDeducted?.home || 0,
        away: fixture.pointsDeducted?.away || 0
    });
    const [goalTimings, setGoalTimings] = useState<GoalTiming[]>(fixture.goalTimings || []);
    const [blogContent, setBlogContent] = useState<string>(fixture.blogContent || '');
    const [newGoal, setNewGoal] = useState<{ minute: number; teamId: string; playerName: string }>({
        minute: 0,
        teamId: fixture.homeTeamId,
        playerName: ''
    });
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const handleSyncWithLive = async () => {
        try {
            setSyncing(true);
            const commentary = await firebaseLeagueService.getCommentary(fixture.id);
            if (!commentary) {
                warning('No commentary found', 'There is no live commentary for this match yet');
                return;
            }

            const goals = (commentary.events || [])
                .filter((e: any) => e.type === 'goal')
                .map((e: any) => ({
                    minute: e.minute,
                    teamId: e.teamId,
                    playerName: e.body.replace(/GOAL!\s*/i, '').split(' - ')[0] || ''
                }));

            const hGoals = goals.filter((g: any) => g.teamId === fixture.homeTeamId).length;
            const aGoals = goals.filter((g: any) => g.teamId === fixture.awayTeamId).length;

            setScore({ home: hGoals, away: aGoals });
            setGoalTimings(goals);
            success('Data synced', `${goals.length} goals imported from live commentary`, 'Review and adjust as needed');
        } catch (error) {
            console.error('Failed to sync live data:', error);
            showError('Sync failed', 'Could not import data from live commentary');
        } finally {
            setSyncing(false);
        }
    };

    const handleAddGoal = () => {
        if (newGoal.minute < 0) return;
        setGoalTimings([...goalTimings, { ...newGoal }]);
        setNewGoal({ ...newGoal, minute: 0, playerName: '' });
    };

    const handleRemoveGoal = (index: number) => {
        setGoalTimings(goalTimings.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateFixture({
                id: fixture.id,
                fixture: {
                    score,
                    pointsAdded,
                    pointsDeducted,
                    goalTimings,
                    blogContent,
                    status: 'completed'
                }
            })).unwrap();

            if (fixture.matchId && score.home !== score.away) {
                const match = await firebaseLeagueService.findMatchById(fixture.matchId);
                if (match && match.nextMatchId) {
                    const winnerId = score.home > score.away ? fixture.homeTeamId : fixture.awayTeamId;
                    const winnerName = score.home > score.away ? fixture.homeTeamName : fixture.awayTeamName;
                    await firebaseLeagueService.advanceWinner(
                        fixture.sport,
                        winnerId,
                        winnerName,
                        match.nextMatchId,
                        match.targetSlot || 0
                    );
                }
            }

            success('Result recorded', `${fixture.homeTeamName} ${score.home} - ${score.away} ${fixture.awayTeamName}`, 'View league standings or record another result');
            onClose();
        } catch (error) {
            console.error('Failed to save result:', error);
            showError('Failed to save', 'Could not record the match result');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Record Match Result</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{fixture.homeTeamName} vs {fixture.awayTeamName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSyncWithLive}
                            disabled={syncing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30"
                        >
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            {syncing ? 'Syncing...' : 'Sync Live'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Final Score */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 text-center underline decoration-2 underline-offset-8">Final Score</h4>
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center space-y-3">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{fixture.homeTeamName}</label>
                                <input
                                    type="number"
                                    value={score.home}
                                    onChange={(e) => setScore({ ...score, home: parseInt(e.target.value) || 0 })}
                                    className="w-24 h-24 text-4xl font-black text-center bg-white dark:bg-gray-700 border-4 border-blue-100 dark:border-blue-800 rounded-3xl focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="text-4xl font-black text-gray-300 dark:text-gray-600 mt-6">:</div>
                            <div className="text-center space-y-3">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{fixture.awayTeamName}</label>
                                <input
                                    type="number"
                                    value={score.away}
                                    onChange={(e) => setScore({ ...score, away: parseInt(e.target.value) || 0 })}
                                    className="w-24 h-24 text-4xl font-black text-center bg-white dark:bg-gray-700 border-4 border-blue-100 dark:border-blue-800 rounded-3xl focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Points Added */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-green-600 uppercase tracking-widest border-l-4 border-green-500 pl-3">Points Added (Bonuses)</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{fixture.homeTeamName}</span>
                                    <input
                                        type="number"
                                        value={pointsAdded.home}
                                        onChange={(e) => setPointsAdded({ ...pointsAdded, home: parseInt(e.target.value) || 0 })}
                                        className="w-16 p-2 text-center bg-white dark:bg-gray-800 border rounded-lg font-black text-green-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{fixture.awayTeamName}</span>
                                    <input
                                        type="number"
                                        value={pointsAdded.away}
                                        onChange={(e) => setPointsAdded({ ...pointsAdded, away: parseInt(e.target.value) || 0 })}
                                        className="w-16 p-2 text-center bg-white dark:bg-gray-800 border rounded-lg font-black text-green-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Points Deducted */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest border-l-4 border-red-500 pl-3">Points Deducted (Penalties)</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{fixture.homeTeamName}</span>
                                    <input
                                        type="number"
                                        value={pointsDeducted.home}
                                        onChange={(e) => setPointsDeducted({ ...pointsDeducted, home: parseInt(e.target.value) || 0 })}
                                        className="w-16 p-2 text-center bg-white dark:bg-gray-800 border rounded-lg font-black text-red-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{fixture.awayTeamName}</span>
                                    <input
                                        type="number"
                                        value={pointsDeducted.away}
                                        onChange={(e) => setPointsDeducted({ ...pointsDeducted, away: parseInt(e.target.value) || 0 })}
                                        className="w-16 p-2 text-center bg-white dark:bg-gray-800 border rounded-lg font-black text-red-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goal Timing (Optional) */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest border-l-4 border-purple-500 pl-3">Goal Timings (Optional)</h4>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {goalTimings.sort((a, b) => a.minute - b.minute).map((gt, i) => (
                                <div key={i} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800">
                                    <span>{gt.minute}'</span>
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                    <span>{gt.teamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName}</span>
                                    {gt.playerName && <>
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                        <span>{gt.playerName}</span>
                                    </>}
                                    <button type="button" onClick={() => handleRemoveGoal(i)} className="ml-1 hover:text-red-500 transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <input
                                type="number"
                                placeholder="Min"
                                value={newGoal.minute || ''}
                                onChange={(e) => setNewGoal({ ...newGoal, minute: parseInt(e.target.value) || 0 })}
                                className="p-2 bg-white dark:bg-gray-800 border rounded-lg text-xs"
                            />
                            <select
                                value={newGoal.teamId}
                                onChange={(e) => setNewGoal({ ...newGoal, teamId: e.target.value })}
                                className="col-span-1 p-2 bg-white dark:bg-gray-800 border rounded-lg text-xs"
                            >
                                <option value={fixture.homeTeamId}>{fixture.homeTeamName}</option>
                                <option value={fixture.awayTeamId}>{fixture.awayTeamName}</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Scorer Name"
                                value={newGoal.playerName}
                                onChange={(e) => setNewGoal({ ...newGoal, playerName: e.target.value })}
                                className="col-span-1 p-2 bg-white dark:bg-gray-800 border rounded-lg text-xs"
                            />
                            <button
                                type="button"
                                onClick={handleAddGoal}
                                className="bg-purple-600 text-white font-black text-[10px] uppercase rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Add Goal
                            </button>
                        </div>
                    </div>

                    {/* Match Summary / Blog */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-l-4 border-gray-400 pl-3">Match Narrative / Summary</h4>
                            <button
                                type="button"
                                onClick={() => setBlogContent(generateMatchReport({ ...fixture, score, goalTimings }))}
                                className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-900/30"
                            >
                                ✨ Generate Magic Summary
                            </button>
                        </div>
                        <textarea
                            value={blogContent}
                            onChange={(e) => setBlogContent(e.target.value)}
                            placeholder="Tell the story of the match..."
                            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-white"
                        />
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Finalize & Record Result'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
