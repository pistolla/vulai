import React, { useState, useEffect } from 'react';
import { Fixture, Athlete, MatchPlayer, Participant } from '@/models';
import { useAppDispatch } from '@/hooks/redux';
import { fetchPlayersByTeam, addPlayer, updateFixture } from '@/store/correspondentThunk';
import { FiX, FiPlus, FiUserPlus, FiUsers, FiSearch, FiCheck, FiLoader, FiShield, FiAlertCircle, FiTrendingUp, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useToast } from '@/components/common/ToastProvider';

interface FixturePlayerManagerProps {
  fixture: Fixture;
  onClose: () => void;
}

type PlayerStatus = MatchPlayer['status'];

export const FixturePlayerManager: React.FC<FixturePlayerManagerProps> = ({ fixture, onClose }) => {
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [participantAthletes, setParticipantAthletes] = useState<Record<string, Athlete[]>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<MatchPlayer[]>(fixture.players || []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeParticipantIndex, setActiveParticipantIndex] = useState(0);
  const [showAddPlayer, setShowAddPlayer] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // New player form state
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    jerseyNumber: '',
    position: '',
    year: 'FR' as Athlete['year']
  });

  // Ensure participants exist (backward compatibility)
  const participants: Participant[] = fixture.participants && fixture.participants.length > 0
    ? fixture.participants
    : ([
        { refType: 'team', refId: fixture.homeTeamId || '', name: fixture.homeTeamName || 'Home', score: 0 },
        { refType: 'team', refId: fixture.awayTeamId || '', name: fixture.awayTeamName || 'Away', score: 0 }
      ] as Participant[]).filter(p => !!p.refId);

  useEffect(() => {
    const loadAllAthletes = async () => {
      setLoading(true);
      try {
        const detailMap: Record<string, Athlete[]> = {};
        
        await Promise.all(participants.map(async (p) => {
          if (p.refType === 'team' && p.refId) {
            const res = await dispatch(fetchPlayersByTeam(p.refId)).unwrap();
            detailMap[p.refId] = res.players;
          } else if (p.refType === 'individual' && p.refId) {
             // For individual participants, we don't necessarily have a "roster" to fetch 
             // but we could treat them as a single athlete in their own list
             detailMap[p.refId] = []; 
          }
        }));
        
        setParticipantAthletes(detailMap);
      } catch (err) {
        showError('Failed to load rosters', 'Please try again');
      } finally {
        setLoading(false);
      }
    };
    loadAllAthletes();
  }, [dispatch, fixture.id]);

  const togglePlayer = (athlete: Athlete, teamId: string, teamName: string) => {
    const index = selectedPlayers.findIndex(p => p.id === athlete.id);
    if (index !== -1) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== athlete.id));
    } else {
      const matchPlayer: MatchPlayer = {
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        name: `${athlete.firstName} ${athlete.lastName}`,
        teamId: teamId,
        teamName: teamName,
        position: athlete.position || '',
        jerseyNumber: athlete.jerseyNumber,
        year: athlete.year,
        status: 'bench',
      };
      setSelectedPlayers(prev => [...prev, matchPlayer]);
    }
  };

  const updatePlayerConfig = (id: string, updates: Partial<MatchPlayer>) => {
    setSelectedPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.firstName || !newPlayer.lastName || showAddPlayer === null) return;
    
    const p = participants[showAddPlayer];
    if (!p || p.refType !== 'team') return;
    
    setSaving(true);
    try {
      const res = await dispatch(addPlayer({
        ...newPlayer,
        teamId: p.refId,
        jerseyNumber: newPlayer.jerseyNumber ? parseInt(newPlayer.jerseyNumber) : undefined
      })).unwrap();
      
      setParticipantAthletes(prev => ({
        ...prev,
        [p.refId]: [...(prev[p.refId] || []), res]
      }));
      
      togglePlayer(res, p.refId, p.name || 'Team');
      success('Player created', `${res.firstName} ${res.lastName} added.`);
      setShowAddPlayer(null);
      setNewPlayer({ firstName: '', lastName: '', jerseyNumber: '', position: '', year: 'FR' });
    } catch (err) {
      showError('Failed to create player', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateFixture({
        id: fixture.id,
        fixture: { players: selectedPlayers }
      })).unwrap();
      success('Board saved', 'Roster configuration updated successfully.');
      onClose();
    } catch (err) {
      showError('Save failed', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const activeParticipant = participants[activeParticipantIndex];
  const activeRoster = activeParticipant ? (participantAthletes[activeParticipant.refId] || []) : [];

  const filterAthletes = (athletes: Athlete[]) => {
    if (!searchTerm) return athletes;
    const lower = searchTerm.toLowerCase();
    return athletes.filter(a => 
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(lower) || 
      a.position?.toLowerCase().includes(lower) ||
      a.jerseyNumber?.toString().includes(lower)
    );
  };

  const startersCount = selectedPlayers.filter(p => p.status === 'starter').length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-white/10">
        
        {/* Modern Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiUsers className="text-white text-3xl" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Match Roster Manager
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {participants.map((p, i) => (
                  <React.Fragment key={p.refId || i}>
                    <span className={`text-xs font-black uppercase tracking-widest ${i % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`}>{p.name}</span>
                    {i < participants.length - 1 && <span className="text-[10px] text-gray-400 font-bold italic">vs</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-3xl hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 transition-all border border-transparent hover:border-red-200">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Participant Databases */}
          <div className="w-1/3 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10">
            
            {/* Participant Selector Tabs */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800">
              {participants.map((p, i) => (
                <button
                  key={p.refId || i}
                  onClick={() => setActiveParticipantIndex(i)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                    activeParticipantIndex === i 
                    ? 'bg-white dark:bg-gray-700 border-blue-600 text-blue-600 dark:text-white shadow-sm' 
                    : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="p-6 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeParticipant?.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 transition-all dark:text-white font-bold text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
              {loading ? (
                 <div className="h-full flex flex-col items-center justify-center gap-4">
                    <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Rosters</p>
                 </div>
              ) : (
                <div className="space-y-4 py-4">
                   <div className="flex justify-between items-center px-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeParticipant?.name} Pool</h4>
                      {activeParticipant?.refType === 'team' && (
                        <button onClick={() => setShowAddPlayer(activeParticipantIndex)} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"><FiUserPlus/> Enroll New</button>
                      )}
                   </div>
                   
                   {activeRoster.length === 0 ? (
                     <div className="text-center py-12 opacity-30">
                        <FiUsers className="mx-auto mb-2 text-3xl" />
                        <p className="text-[10px] font-black uppercase">No registry data</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-2">
                       {filterAthletes(activeRoster).map(a => {
                         const sel = selectedPlayers.find(p => p.id === a.id);
                         return (
                           <div key={a.id} onClick={() => togglePlayer(a, activeParticipant.refId, activeParticipant.name || '')} className={`p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${sel ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-500/30'}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${sel ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>#{a.jerseyNumber || '?'}</div>
                                <div>
                                  <p className="font-black text-sm">{a.firstName} {a.lastName}</p>
                                  <p className={`text-[10px] font-bold uppercase ${sel ? 'text-blue-100' : 'text-gray-400'}`}>{a.position || 'No Role'}</p>
                                </div>
                              </div>
                              {sel && <FiCheck strokeWidth={4} />}
                           </div>
                         )
                       })}
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Match Board Configuration */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
             <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-3">
                      {participants.map((p, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-xs font-black text-white ${i % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600'}`}>
                           {p.name?.charAt(0) || '?'}
                        </div>
                      ))}
                   </div>
                   <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">Match Day Tactical Board</h4>
                </div>
                <div className="flex gap-4">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                     {startersCount} Starters
                   </div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                     {selectedPlayers.length} Total Registered
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {participants.map((participant, pIdx) => {
                  const participantPlayers = selectedPlayers.filter(p => p.teamId === participant.refId);
                  if (participantPlayers.length === 0) return null;

                  return (
                    <div key={participant.refId || pIdx} className="space-y-6">
                       <div className="flex items-center gap-4">
                          <h5 className={`text-xs font-black uppercase tracking-[0.3em] ${pIdx % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`}>{participant.name}</h5>
                          <div className="flex-1 h-px bg-gray-100 dark:border-gray-800"></div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Starters First */}
                          {participantPlayers.sort((a,b) => a.status === 'starter' ? -1 : 1).map(p => (
                            <div key={p.id} className={`group bg-white dark:bg-gray-800/50 rounded-[2rem] p-6 border-2 transition-all ${p.status === 'starter' ? 'border-green-500/20 shadow-lg shadow-green-500/5' : 'border-gray-100 dark:border-gray-800'}`}>
                              <div className="flex justify-between items-start mb-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${p.status === 'starter' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                       #{p.jerseyNumber}
                                    </div>
                                    <div>
                                       <p className="font-black text-gray-900 dark:text-white">{p.name}</p>
                                       <p className="text-[10px] font-bold text-gray-400 uppercase">{p.position}</p>
                                    </div>
                                 </div>
                                 <button onClick={() => togglePlayer({ id: p.id } as any, '', '')} className="p-2 text-gray-200 hover:text-red-500 transition-all"><FiX size={18}/></button>
                              </div>

                              <div className="flex flex-col gap-4">
                                 <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block mx-1">Tactical Status</label>
                                    <div className="flex bg-gray-50 dark:bg-gray-900 rounded-2xl p-1 gap-1 border border-gray-100 dark:border-gray-800">
                                      {(['starter', 'bench', 'reserve', 'injured'] as PlayerStatus[]).map(s => (
                                        <button 
                                          key={s} 
                                          onClick={() => updatePlayerConfig(p.id, { status: s })}
                                          className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${p.status === s ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                 </div>
                                 
                                 <div className="flex gap-2">
                                    <div className="flex-1">
                                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 mx-1 block">Role Override</label>
                                       <input 
                                         type="text" 
                                         className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl text-xs font-bold dark:text-white border-2 border-transparent focus:border-blue-500"
                                         value={p.position}
                                         onChange={(e) => updatePlayerConfig(p.id, { position: e.target.value })}
                                       />
                                    </div>
                                    {p.status !== 'starter' && (
                                       <button onClick={() => updatePlayerConfig(p.id, { status: 'starter' })} className="mt-5 px-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Start</button>
                                    )}
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                })}

                {selectedPlayers.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20">
                      <FiShield size={80} className="mb-4" />
                      <p className="font-black uppercase tracking-[0.2em] text-lg">Empty Match Board</p>
                      <p className="text-sm font-bold mt-2">Select participants from the registry on the left to begin match-day assignments.</p>
                   </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-8 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="hidden sm:flex items-center gap-4">
                   <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-gray-100 dark:border-gray-700">
                      {selectedPlayers.length}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Roster Snapshot</p>
                      <p className="text-xs font-bold dark:text-white">Synced with Fixture Data</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={onClose} className="px-10 py-5 bg-white dark:bg-gray-800 rounded-[2rem] text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">Discard</button>
                   <button 
                     disabled={saving}
                     onClick={handleSave}
                     className="px-14 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                   >
                     {saving ? <FiLoader className="animate-spin" /> : <FiCheck strokeWidth={3} />}
                     {saving ? 'Synchronizing...' : 'Commit Board'}
                   </button>
                </div>
             </div>
          </div>

        </div>

        {/* Nested Modal: Add New Player */}
        {showAddPlayer !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-xl p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
              <div className="flex justify-between items-center mb-10">
                <div>
                   <h5 className="text-3xl font-black dark:text-white uppercase tracking-tighter">
                     New Participant Player
                   </h5>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Enrolling for {participants[showAddPlayer].name}</p>
                </div>
                <button onClick={() => setShowAddPlayer(null)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 transition-all font-bold dark:text-white"
                      value={newPlayer.firstName}
                      onChange={e => setNewPlayer(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 transition-all font-bold dark:text-white"
                      value={newPlayer.lastName}
                      onChange={e => setNewPlayer(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jersey Number</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 transition-all font-bold dark:text-white text-center text-xl"
                      value={newPlayer.jerseyNumber}
                      onChange={e => setNewPlayer(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Center Forward"
                      className="w-full px-6 py-5 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 transition-all font-bold dark:text-white"
                      value={newPlayer.position}
                      onChange={e => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['FR', 'SO', 'JR', 'SR', 'GR'] as Athlete['year'][]).map(y => (
                      <button
                        key={y}
                        onClick={() => setNewPlayer(prev => ({ ...prev, year: y }))}
                        className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                          newPlayer.year === y 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    disabled={saving || !newPlayer.firstName || !newPlayer.lastName}
                    onClick={handleAddPlayer}
                    className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Processing Entry...' : 'Finalize System Enrollment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 20px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

      </div>
    </div>
  );
};
