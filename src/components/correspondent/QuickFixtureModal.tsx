import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { League, Group, Stage, Participant, Match, Season, Sport } from '@/models';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createMatch, createStage, createGroup } from '@/store/correspondentThunk';
import { setMatches, setStages, setGroups } from '@/store/slices/correspondentSlice';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';
import { toISO } from '@/utils/csvHelpers';
import { apiService } from '@/services/apiService';
import { useToast } from '@/components/common/ToastProvider';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiAlertCircle, FiPlus, FiArrowRight, FiX } from 'react-icons/fi';

interface QuickFixtureModalProps {
    isOpen: boolean;
    onClose: () => void;
    league: League | null;
}

interface TeamOption {
    id: string;
    name: string;
    university?: string;
}

export const QuickFixtureModal: React.FC<QuickFixtureModalProps> = ({ isOpen, onClose, league }) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(toISO());
    const [venue, setVenue] = useState('');
    const [stageName, setStageName] = useState('Regular Season');
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [homeTeamId, setHomeTeamId] = useState<string>('');
    const [awayTeamId, setAwayTeamId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { success, error: showError, warning } = useToast();

    // Load teams, seasons, and validate league
    useEffect(() => {
        if (isOpen && league) {
            loadTeams();
            loadSeasons();
        }
    }, [isOpen, league?.id]);

    const loadTeams = async () => {
        try {
            const allTeams = await apiService.getTeams();
            // Filter teams by sport if league has a sport
            const sportName = league?.sportName?.toLowerCase() || '';
            const filteredTeams = allTeams.filter((t: any) => {
                if (!sportName) return true;
                return t.sport?.toLowerCase() === sportName || t.sportName?.toLowerCase() === sportName;
            });
            
            // Format teams with university info
            const formattedTeams: TeamOption[] = filteredTeams.map((t: any) => ({
                id: t.id,
                name: t.name,
                university: t.universityName || t.universityId
            }));
            setTeams(formattedTeams);
        } catch (error) {
            console.error('Failed to load teams:', error);
            setTeams([]);
        }
    };

    const loadSeasons = async () => {
        try {
            const sports: Sport[] = await apiService.getSports();
            const sport = sports.find(s => s.name.toLowerCase() === league?.sportName?.toLowerCase() || s.name.toLowerCase() === league?.name?.toLowerCase());
            if (sport) {
                const leagueSeasons = await firebaseLeagueService.listSeasons(sport.id);
                setSeasons(leagueSeasons);
                const active = leagueSeasons.find(s => s.isActive);
                if (active) setSelectedSeasonId(active.id);
            }
        } catch (error) {
            console.error('Failed to load seasons:', error);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!homeTeamId) newErrors.homeTeam = 'Select home team';
        if (!awayTeamId) newErrors.awayTeam = 'Select away team';
        if (homeTeamId === awayTeamId) newErrors.sameTeam = 'Teams must be different';
        if (!selectedSeasonId) newErrors.season = 'Select a season';
        if (!date) newErrors.date = 'Select date and time';
        if (!venue.trim()) newErrors.venue = 'Enter venue';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getSelectedTeam = (teamId: string) => teams.find(t => t.id === teamId);

    if (!league) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            warning('Please fix the errors', 'Check the highlighted fields below');
            return;
        }

        setLoading(true);
        try {
            const homeTeam = getSelectedTeam(homeTeamId);
            const awayTeam = getSelectedTeam(awayTeamId);

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

            // 3. Create match with proper participant data
            const participants: Participant[] = [
                { refType: 'team', refId: homeTeamId, name: homeTeam?.name || 'Unknown', score: 0 },
                { refType: 'team', refId: awayTeamId, name: awayTeam?.name || 'Unknown', score: 0 }
            ];

            const match: Omit<Match, 'id'> = {
                matchNumber: 1,
                date,
                venue: venue.trim(),
                status: 'pending',
                participants,
                seasonId: selectedSeasonId
            };

            await dispatch(createMatch({ leagueId: league.id!, groupId, stageId, match, seasonId: selectedSeasonId }));

            // Refresh matches
            const updatedMatches = await firebaseLeagueService.listMatches(league.id!, groupId, stageId);
            dispatch(setMatches({ leagueId: league.id!, groupId, stageId, matches: updatedMatches }));

            success('Fixture created successfully', `${homeTeam?.name} vs ${awayTeam?.name} scheduled`, 'View match details or create another fixture');
            onClose();
        } catch (error) {
            console.error('Quick fixture failed:', error);
            showError('Failed to create fixture', 'Please try again or contact support');
        } finally {
            setLoading(false);
        }
    };

    const InputError = ({ message }: { message?: string }) => (
        message ? (
            <div className="flex items-center gap-1 mt-1 text-red-500 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
                <FiAlertCircle className="w-3 h-3" />
                <span>{message}</span>
            </div>
        ) : null
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Quick Fixture" fullScreen={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* League Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 dark:text-blue-100">{league.name}</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{league.sportName}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                            Stage Name
                        </label>
                        <input
                            value={stageName}
                            onChange={e => setStageName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 dark:text-white font-bold"
                            placeholder="e.g. Finals"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                            Venue <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                value={venue}
                                onChange={e => {
                                    setVenue(e.target.value);
                                    setErrors(prev => ({ ...prev, venue: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${
                                    errors.venue ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'
                                } dark:text-white font-bold`}
                                placeholder="Stadium name"
                            />
                        </div>
                        <InputError message={errors.venue} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                            Season <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedSeasonId}
                            onChange={e => {
                                setSelectedSeasonId(e.target.value);
                                setErrors(prev => ({ ...prev, season: '' }));
                            }}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${
                                errors.season ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'
                            } dark:text-white font-bold appearance-none`}
                        >
                            <option value="">Select Season</option>
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
                            ))}
                        </select>
                        <InputError message={errors.season} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2">
                            Date & Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={e => {
                                    setDate(e.target.value);
                                    setErrors(prev => ({ ...prev, date: '' }));
                                }}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${
                                    errors.date ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'
                                } dark:text-white font-bold`}
                                required
                            />
                        </div>
                        <InputError message={errors.date} />
                    </div>
                </div>

                {/* Team Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-3">
                        Select Teams <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <select
                                value={homeTeamId}
                                onChange={e => {
                                    setHomeTeamId(e.target.value);
                                    setErrors(prev => ({ ...prev, homeTeam: '', sameTeam: '' }));
                                }}
                                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${
                                    errors.homeTeam || errors.sameTeam ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'
                                } dark:text-white font-bold appearance-none`}
                            >
                                <option value="">Home Team</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.homeTeam} />
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <FiArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <select
                                value={awayTeamId}
                                onChange={e => {
                                    setAwayTeamId(e.target.value);
                                    setErrors(prev => ({ ...prev, awayTeam: '', sameTeam: '' }));
                                }}
                                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${
                                    errors.awayTeam || errors.sameTeam ? 'border-red-300 dark:border-red-600' : 'border-transparent focus:border-blue-500'
                                } dark:text-white font-bold appearance-none`}
                            >
                                <option value="">Away Team</option>
                                {teams.filter(t => t.id !== homeTeamId).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.awayTeam} />
                        </div>
                    </div>
                    
                    {errors.sameTeam && (
                        <div className="flex items-center gap-1 mt-2 text-red-500 dark:text-red-400 text-sm animate-in slide-in-from-top-1">
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{errors.sameTeam}</span>
                        </div>
                    )}

                    {/* Selected Teams Preview */}
                    {homeTeamId && awayTeamId && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-green-800 dark:text-green-200">Home</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{getSelectedTeam(homeTeamId)?.name}</span>
                                </div>
                                <span className="font-black text-2xl text-green-600">VS</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900 dark:text-white">{getSelectedTeam(awayTeamId)?.name}</span>
                                    <span className="text-sm font-bold text-green-800 dark:text-green-200">Away</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Fixture...</span>
                        </>
                    ) : (
                        <>
                            <FiCheckCircle className="w-5 h-5" />
                            <span>Create Fixture</span>
                        </>
                    )}
                </button>
            </form>
        </Modal>
    );
};
