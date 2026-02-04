import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { League, Group, StageType } from "@/models";
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";
import { RootState } from "@/store";
import { createStage, deleteStage, updateStage } from "@/store/correspondentThunk";
import { setStages } from "@/store/slices/correspondentSlice";
import { useState, useEffect } from "react";
import { MatchManager } from "./MatchManager";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/common/ToastProvider";
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiLayers, FiAward, FiArrowRight, FiX } from "react-icons/fi";

// --- StageManager ---
export const StageManager: React.FC<{ league: League; group?: Group | null }> = ({ league, group }) => {
  const dispatch = useAppDispatch();
  const effectiveGroupId = group?.id || '_general';
  const stages = useAppSelector((s: RootState) => s.correspondent.stages[`${league.id}_${effectiveGroupId}`] ?? []);
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [addingSubstageTo, setAddingSubstageTo] = useState<string | null>(null);
  const { success, error: showError, warning } = useToast();

  const topLevelStages = stages.filter((s: any) => !s.parentStageId).sort((a: any, b: any) => a.order - b.order);

  useEffect(() => {
    (async () => {
      try {
        const list = await firebaseLeagueService.listStages(league.id!, effectiveGroupId);
        dispatch(setStages({ leagueId: league.id!, groupId: effectiveGroupId, stages: list }));
      } catch (error) {
        console.error('[StageManager] Failed to load stages:', error);
      }
    })();
  }, [league.id, effectiveGroupId, dispatch]);

  // Quick add stage from top
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddType, setQuickAddType] = useState<StageType>('knockout');
  const [isAddingTopLevel, setIsAddingTopLevel] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) return warning('Stage name required', 'Please enter a name');

    try {
      const nextOrder = topLevelStages.length + 1;
      await dispatch(createStage({
        leagueId: league.id!,
        groupId: effectiveGroupId,
        stage: { name: quickAddName.trim(), order: nextOrder, type: quickAddType }
      })).unwrap();

      const list = await firebaseLeagueService.listStages(league.id!, effectiveGroupId);
      dispatch(setStages({ leagueId: league.id!, groupId: effectiveGroupId, stages: list }));
      setQuickAddName('');
      setIsAddingTopLevel(false);
      success('Stage created', `"${quickAddName}" has been added`, 'Add substages or create matches');
    } catch (error) {
      console.error('Failed to create stage:', error);
      showError('Failed to create stage', 'Please try again');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <FiLayers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">Tournament Stages</h3>
            <p className="text-blue-100 text-sm">{stages.length} stages • {topLevelStages.length} top-level</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); setIsAddingTopLevel(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Stage
          </button>
          {isExpanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Quick Add Form */}
          {isAddingTopLevel && (
            <form onSubmit={handleQuickAdd} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-in slide-in-from-top duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">Add New Stage</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">Create a top-level tournament phase</p>
                </div>
                <button type="button" onClick={() => setIsAddingTopLevel(false)} className="text-blue-400 hover:text-blue-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="Stage name (e.g., Quarter Finals)"
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  autoFocus
                />
                <select
                  value={quickAddType}
                  onChange={(e) => setQuickAddType(e.target.value as StageType)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="knockout">Knockout</option>
                  <option value="round_robin">Round Robin</option>
                </select>
                <button
                  type="submit"
                  disabled={!quickAddName.trim()}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Stage
                </button>
              </div>
            </form>
          )}

          {/* Stages Tree */}
          <div className="space-y-3">
            {stages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <FiAward className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">No stages yet</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Create your first stage to organize the tournament</p>
                <button
                  onClick={() => setIsAddingTopLevel(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add First Stage
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Tree connector line */}
                {topLevelStages.length > 1 && (
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30" />
                )}
                
                {topLevelStages.map((stage, index) => (
                  <StageTreeItem
                    key={stage.id}
                    stage={stage}
                    allStages={stages}
                    league={league}
                    effectiveGroupId={effectiveGroupId}
                    index={index}
                    isLast={index === topLevelStages.length - 1}
                    onAddSubstage={(parentId) => setAddingSubstageTo(parentId)}
                    addingSubstageTo={addingSubstageTo}
                    onCancelSubstage={() => setAddingSubstageTo(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- StageTreeItem Component ---
const StageTreeItem: React.FC<{
  stage: any;
  allStages: any[];
  league: League;
  effectiveGroupId: string;
  index: number;
  isLast: boolean;
  onAddSubstage: (parentId: string) => void;
  addingSubstageTo: string | null;
  onCancelSubstage: () => void;
}> = ({ stage, allStages, league, effectiveGroupId, index, isLast, onAddSubstage, addingSubstageTo, onCancelSubstage }) => {
  const dispatch = useAppDispatch();
  const { success, error: showError, warning } = useToast();
  
  const substages = allStages.filter(s => s.parentStageId === stage.id).sort((a, b) => a.order - b.order);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);
  const [isAddingSubstage, setIsAddingSubstage] = useState(false);
  const [substageName, setSubstageName] = useState('');
  const [substageType, setSubstageType] = useState<StageType>('knockout');

  // Substage form submission
  const handleAddSubstage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!substageName.trim()) return warning('Substage name required', 'Please enter a name');

    try {
      const nextOrder = substages.length + 1;
      await dispatch(createStage({
        leagueId: league.id!,
        groupId: effectiveGroupId,
        stage: { name: substageName.trim(), order: nextOrder, type: substageType, parentStageId: stage.id }
      })).unwrap();

      const list = await firebaseLeagueService.listStages(league.id!, effectiveGroupId);
      dispatch(setStages({ leagueId: league.id!, groupId: effectiveGroupId, stages: list }));
      setSubstageName('');
      setIsAddingSubstage(false);
      success('Substage created', `"${substageName}" added to ${stage.name}`, 'Continue adding or manage matches');
    } catch (error) {
      console.error('Failed to create substage:', error);
      showError('Failed to create substage', 'Please try again');
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    try {
      await dispatch(updateStage({
        leagueId: league.id!,
        groupId: effectiveGroupId,
        stageId: stage.id,
        data: { name: editName.trim() }
      }));
      setIsEditing(false);
      success('Stage updated', 'Name changed successfully');
    } catch (error) {
      console.error('Failed to update stage:', error);
      showError('Failed to update', 'Please try again');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${stage.name}" and all its substages?`)) return;
    try {
      // Delete all substages first
      for (const substage of substages) {
        await dispatch(deleteStage({ leagueId: league.id!, groupId: effectiveGroupId, stageId: substage.id }));
      }
      await dispatch(deleteStage({ leagueId: league.id!, groupId: effectiveGroupId, stageId: stage.id }));
      success('Stage deleted', `${stage.name} and ${substages.length} substages removed`);
    } catch (error) {
      console.error('Failed to delete:', error);
      showError('Failed to delete', 'Please try again');
    }
  };

  return (
    <div className="relative">
      {/* Connector line to parent */}
      {!isLast && (
        <div className="absolute left-6 top-10 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
      )}

      <div className={`
        relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200
        ${isEditing ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}
        ${substages.length > 0 ? 'mb-4' : 'mb-2'}
      `}>
        {/* Stage Header */}
        <div className="flex items-center gap-4 p-4">
          {/* Expand/Collapse Toggle */}
          {substages.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isExpanded ? <FiChevronDown className="w-5 h-5 text-gray-500" /> : <FiChevronRight className="w-5 h-5 text-gray-500" />}
            </button>
          )}
          
          {/* Stage Number Badge */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
            ${stage.type === 'knockout' 
              ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' 
              : 'bg-gradient-to-br from-green-500 to-teal-500 text-white'}
          `}>
            {index + 1}
          </div>

          {/* Stage Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  <FiArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(stage.name); }} className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{stage.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                    ${stage.type === 'knockout'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}
                  `}>
                    {stage.type.replace('_', ' ')}
                  </span>
                  {substages.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {substages.length} substages
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsAddingSubstage(!isAddingSubstage)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-xs font-bold transition-colors"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  Substage
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Substage Add Form */}
        {isAddingSubstage && (
          <form onSubmit={handleAddSubstage} className="px-4 pb-4 animate-in slide-in-from-top duration-200">
            <div className="ml-14 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-purple-900 dark:text-purple-100">Add Substage to "{stage.name}"</span>
                <button type="button" onClick={() => setIsAddingSubstage(false)} className="text-purple-400 hover:text-purple-600">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={substageName}
                  onChange={(e) => setSubstageName(e.target.value)}
                  placeholder="Substage name"
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  autoFocus
                />
                <select
                  value={substageType}
                  onChange={(e) => setSubstageType(e.target.value as StageType)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="knockout">Knockout</option>
                  <option value="round_robin">Round Robin</option>
                </select>
                <button
                  type="submit"
                  disabled={!substageName.trim()}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Substage
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Match Manager */}
        <div className="px-4 pb-4">
          <div className="ml-14">
            <MatchManager league={league} group={null} stage={stage} />
          </div>
        </div>
      </div>

      {/* Sub-stages (nested) */}
      {isExpanded && substages.length > 0 && (
        <div className="ml-14 space-y-2 animate-in slide-in-from-top-2 duration-300">
          {substages.map((substage, subIndex) => (
            <StageTreeItem
              key={substage.id}
              stage={substage}
              allStages={allStages}
              league={league}
              effectiveGroupId={effectiveGroupId}
              index={subIndex}
              isLast={subIndex === substages.length - 1}
              onAddSubstage={onAddSubstage}
              addingSubstageTo={addingSubstageTo}
              onCancelSubstage={onCancelSubstage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
