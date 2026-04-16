import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import React, { useState, useEffect } from "react";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { FixtureResultPopup } from "./FixtureResultPopup";
import { Fixture, Match, League, Group, Stage } from "@/models";
import { updateFixture, deleteFixture } from "@/store/correspondentThunk";

import { FiClock, FiCheckCircle, FiActivity, FiMapPin, FiCalendar, FiTrash2, FiUsers, FiFileText, FiEdit3 } from 'react-icons/fi';
import { FixturePlayerManager } from "./FixturePlayerManager";
import { FixtureNewsEditor } from "./FixtureNewsEditor";
import { useToast } from "@/components/common/ToastProvider";

interface FixtureListProps {
  onSelect: (match: Match, league: League) => void;
  onEditFixture?: (fixture: Fixture) => void;
}

export const FixtureList: React.FC<FixtureListProps> = ({ onSelect, onEditFixture }) => {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'explorer'>('fixtures');
  
  const fixtures = useAppSelector((state) => state.correspondent.fixtures) || [];
  const leagues = useAppSelector((state) => state.correspondent.leagues) || [];
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [managingPlayersFixture, setManagingPlayersFixture] = useState<Fixture | null>(null);
  const [editingNewsFixture, setEditingNewsFixture] = useState<Fixture | null>(null);
  
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();

  const handleDeleteFixture = async (fixture: Fixture) => {
    if (!window.confirm(`Are you sure you want to delete the fixture: ${fixture.homeTeamName} vs ${fixture.awayTeamName}? This cannot be undone.`)) {
      return;
    }

    try {
      await dispatch(deleteFixture({ id: fixture.id, seasonId: fixture.seasonId! })).unwrap();
      success('Fixture Deleted', 'The fixture has been removed from your log.');
    } catch (err) {
      showError('Delete Failed', 'Could not delete fixture. Ensure you have permissions.');
    }
  };
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [explorerMatches, setExplorerMatches] = useState<Match[]>([]);
  const [exploring, setExploring] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Load Groups for Explorer
  useEffect(() => {
    if (activeTab === 'explorer' && selectedLeagueId) {
      setGroups([]);
      setStages([]);
      setSelectedGroupId('');
      setSelectedStageId('');
      setExplorerMatches([]);
      firebaseLeagueService.listGroups(selectedLeagueId).then(g => {
        setGroups(g.length > 0 ? g : [{ id: '_general', name: 'General' } as Group]);
      });
    }
  }, [activeTab, selectedLeagueId]);

  // Load Stages for Explorer
  useEffect(() => {
    if (activeTab === 'explorer' && selectedLeagueId && selectedGroupId) {
      setStages([]);
      setSelectedStageId('');
      setExplorerMatches([]);
      firebaseLeagueService.listStages(selectedLeagueId, selectedGroupId).then(s => setStages(s));
    }
  }, [selectedGroupId, selectedLeagueId, activeTab]);

  // Load Matches for Explorer
  useEffect(() => {
    if (activeTab === 'explorer' && selectedLeagueId && selectedGroupId && selectedStageId) {
      setExploring(true);
      firebaseLeagueService.listMatches(selectedLeagueId, selectedGroupId, selectedStageId)
        .then(m => setExplorerMatches(m.filter(match => match.participants.length >= 2)))
        .finally(() => setExploring(false));
    }
  }, [selectedStageId, selectedGroupId, selectedLeagueId, activeTab]);


  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      let successCount = 0;

      for (const line of lines) {
        const [matchNum, hScore, aScore] = line.split(',').map(s => s.trim());
        if (!matchNum || hScore === undefined || aScore === undefined) continue;

        const fixture = fixtures.find(f => explorerMatches.some(m => m.id === f.matchId && m.matchNumber?.toString() === matchNum));

        if (fixture) {
          try {
            await dispatch(updateFixture({
              id: fixture.id,
              fixture: {
                score: { home: parseInt(hScore), away: parseInt(aScore) },
                status: 'completed'
              }
            })).unwrap();
            successCount++;
          } catch (err) {
            console.error(`Failed to update fixture for match #${matchNum}`, err);
          }
        }
      }
      alert(`Bulk update complete. Successfully processed ${successCount} fixtures.`);
      setBulkProcessing(false);
    };
    reader.readAsText(file);
  };

  const statusBadge = (fixture: Fixture) => {
    switch (fixture.status) {
      case 'completed': return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold w-fit">Completed</span>;
      case 'live': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold w-fit flex items-center gap-1"><FiActivity className="animate-pulse" /> Live</span>;
      case 'scheduled': default: return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold w-fit">Scheduled</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-4 sm:p-8">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-black dark:text-white">Fixtures Log</h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'fixtures' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            My Fixtures
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'explorer' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Match Explorer
          </button>
        </div>
      </div>

      {activeTab === 'fixtures' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          {fixtures.length === 0 ? (
             <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="font-bold text-lg mb-2">No Fixtures Found</p>
                <p className="text-sm">You haven't created any fixtures yet. Click Create Fixture to begin.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {fixtures.map(f => (
                <div key={f.id} className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 flex flex-col gap-3 transition-colors hover:border-blue-400 dark:hover:border-blue-500">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{f.type} • {f.sport}</div>
                      <div className="font-bold text-lg dark:text-white flex flex-wrap items-center gap-2">
                        {f.participants && f.participants.length > 0 ? (
                          f.participants.map((p, i) => (
                            <React.Fragment key={p.refId || i}>
                              <span>{p.name}</span>
                              {i < f.participants.length - 1 && (
                                <span className="text-gray-400 text-sm font-black italic">vs</span>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <>{f.homeTeamName} vs {f.awayTeamName}</>
                        )}
                      </div>
                    </div>
                    {statusBadge(f)}
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1"><FiCalendar /> {f.scheduledAt ? new Date(f.scheduledAt).toLocaleDateString() : 'TBD'}</div>
                    <div className="flex items-center gap-1"><FiMapPin /> {f.venue || 'TBD'}</div>
                  </div>

                  <div className="mt-2 text-sm flex items-center gap-2">
                    {f.approved === false ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold w-fit">Pending Approval</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold w-fit flex items-center gap-1"><FiCheckCircle/> Approved</span>
                    )}
                    {f.score && (
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        Score: {f.score.home} - {f.score.away}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-2 justify-end mt-auto">
                    {onEditFixture && (
                      <button onClick={(e) => { e.stopPropagation(); onEditFixture(f); }} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-1.5 transition-all">
                        <FiEdit3 /> Edit
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setManagingPlayersFixture(f); }} 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <FiUsers /> Players
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingNewsFixture(f); }} 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <FiFileText /> News
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFixture(f); }} 
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-bold px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <FiTrash2 /> Delete
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedFixture(f); }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20">
                      <FiActivity /> Live Center
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-800/50">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Explorer Mode</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-6">
              Use this mode to manually discover pre-generated tournament matches and assign them into live fixtures.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white" value={selectedLeagueId} onChange={e => setSelectedLeagueId(e.target.value)}>
                <option value="">1. Select League...</option>
                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>

              <select disabled={!selectedLeagueId} className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white disabled:opacity-50" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                <option value="">2. Select Group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <select disabled={!selectedGroupId} className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white disabled:opacity-50" value={selectedStageId} onChange={e => setSelectedStageId(e.target.value)}>
                <option value="">3. Select Stage...</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {selectedStageId && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 mb-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Bulk Operations</h4>
                <p className="text-[10px] text-indigo-400 dark:text-indigo-500 font-bold">Upload CSV (matchNumber, homeScore, awayScore) for mapped fixtures below</p>
              </div>
              <div className="flex gap-2">
                <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" id="bulk-csv" disabled={bulkProcessing} />
                <label htmlFor="bulk-csv" className="cursor-pointer px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase rounded-lg hover:bg-indigo-700 transition-all">
                  {bulkProcessing ? 'Processing...' : 'Upload CSV'}
                </label>
              </div>
            </div>
          )}

          {exploring ? (
             <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
             </div>
          ) : selectedStageId && explorerMatches.length === 0 ? (
             <div className="text-center py-8 text-gray-500 dark:text-gray-400">
               <p className="font-medium">No matches found in this stage.</p>
             </div>
          ) : selectedStageId && explorerMatches.length > 0 ? (
             <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Match #</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participants</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {explorerMatches.map(match => {
                      const existingFx = fixtures.find(f => f.matchId === match.id);
                      return (
                        <tr key={match.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium dark:text-white">#{match.matchNumber}</td>
                          <td className="px-4 py-3 text-sm dark:text-white">
                            {existingFx ? `${existingFx.homeTeamName} vs ${existingFx.awayTeamName}` : match.participants.map(p => p.name || `TBD ${p.refId}`).join(' vs ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                            {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
                          </td>
                          <td className="px-4 py-3 text-sm flex gap-2 justify-end">
                            {existingFx ? (
                              <button onClick={() => setSelectedFixture(existingFx)} className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Recording Live</button>
                            ) : (
                              <button onClick={() => onSelect(match, leagues.find(l => l.id === selectedLeagueId)!)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold">
                                Create Fixture
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
             </div>
          ) : null}
        </div>
      )}

      {selectedFixture && (
        <FixtureResultPopup
          fixture={selectedFixture}
          onClose={() => setSelectedFixture(null)}
        />
      )}

      {managingPlayersFixture && (
        <FixturePlayerManager
          fixture={managingPlayersFixture}
          onClose={() => setManagingPlayersFixture(null)}
        />
      )}

      {editingNewsFixture && (
        <FixtureNewsEditor
          fixture={editingNewsFixture}
          onClose={() => setEditingNewsFixture(null)}
        />
      )}
    </div>
  );
};