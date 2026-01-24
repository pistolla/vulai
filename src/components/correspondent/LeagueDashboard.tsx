import { League, Match, Group } from "@/models";
import { useState } from "react";
import { GroupManager } from "./GroupManager";
import { LeagueForm } from "./LeagueForm";
import { LeagueList } from "./LeagueList";
import { StageManager } from "./StageManager";
import { MatchManager } from "./MatchManager";
import { LeagueVisualizer } from "./LeagueVisualizer.tsx";
import { useTheme } from "@/components/ThemeProvider";

// --- Top-level Dashboard Component ---
export const LeagueDashboard: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentStep, setCurrentStep] = useState<'leagues' | 'groups' | 'stages' | 'visualize'>('leagues');
  const [viewMode, setViewMode] = useState<'manage' | 'visualize'>('manage');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const { theme } = useTheme();

  const steps = [
    { id: 'leagues', label: 'Leagues', icon: '🏆' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'stages', label: 'Stages & Matches', icon: '🏅' },
    { id: 'visualize', label: 'Visualize', icon: '📊' }
  ];

  const canAccessStep = (step: string) => {
    if (step === 'leagues') return true;
    if (step === 'groups') return !!selectedLeague;
    if (step === 'stages') return !!selectedGroup;
    if (step === 'visualize') return !!selectedLeague;
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'leagues':
        return (
          <div className="space-y-6">
            <LeagueForm onCreate={(l) => { setSelectedLeague(l); setCurrentStep('groups'); }} />
            <LeagueList onSelect={(l) => { setSelectedLeague(l); setCurrentStep('groups'); }} />
          </div>
        );
      case 'groups':
        return selectedLeague ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black dark:text-white mb-2">{selectedLeague.name}</h3>

              {/* Description Editor */}
              <div className="mb-4 group relative">
                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      defaultValue={selectedLeague.description}
                      onBlur={(e) => {
                        // Here you would dispatch an update action. For now, we just flip state back.
                        // In a real app: dispatch(updateLeague({ ...selectedLeague, description: e.target.value }))
                        setIsEditingDesc(false);
                      }}
                      autoFocus
                    />
                    <p className="text-xs text-gray-400">Click outside to save (Simulation)</p>
                  </div>
                ) : (
                  <div onClick={() => setIsEditingDesc(true)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -ml-2 rounded-lg transition-colors">
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedLeague.description || "No description provided. Click to add one."}
                    </p>
                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to edit description</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-bold">{selectedLeague.sportType}</span>
              </div>
            </div>
            <GroupManager
              league={selectedLeague}
              onGroupSelect={(group) => { setSelectedGroup(group); setCurrentStep('stages'); }}
            />
          </div>
        ) : null;
      case 'stages':
        return selectedGroup ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black dark:text-white mb-2">{selectedGroup.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">Manage stages and matches for this group</p>
            </div>
            <StageManager league={selectedLeague!} group={selectedGroup!} />
          </div>
        ) : null;
      case 'visualize':
        return selectedLeague ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black dark:text-white mb-2">{selectedLeague.name} - League Visualization</h3>
              <p className="text-gray-600 dark:text-gray-300">Click on match nodes to view details</p>
            </div>
            <LeagueVisualizer league={selectedLeague} />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-6">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black dark:text-white">League Management Wizard</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const isAccessible = canAccessStep(step.id);

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isAccessible && setCurrentStep(step.id as any)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : isCompleted
                      ? 'bg-green-600 text-white'
                      : isAccessible
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <span>{step.icon}</span>
                  <span className={`${isActive ? 'inline' : 'hidden md:inline'}`}>{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-4 md:w-8 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            const currentIndex = steps.findIndex(s => s.id === currentStep);
            if (currentIndex > 0) {
              const prevStep = steps[currentIndex - 1].id as any;
              if (canAccessStep(prevStep)) setCurrentStep(prevStep);
            }
          }}
          disabled={currentStep === 'leagues'}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => {
            const currentIndex = steps.findIndex(s => s.id === currentStep);
            if (currentIndex < steps.length - 1) {
              const nextStep = steps[currentIndex + 1].id as any;
              if (canAccessStep(nextStep)) setCurrentStep(nextStep);
            }
          }}
          disabled={!canAccessStep(steps[steps.findIndex(s => s.id === currentStep) + 1]?.id)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};