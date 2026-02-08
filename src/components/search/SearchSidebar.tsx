import React from 'react';
import { League, University, Sport } from '@/models';
import { FiChevronDown, FiChevronRight, FiLayers, FiHome, FiActivity } from 'react-icons/fi';

interface FilterSection {
    title: string;
    icon: React.ReactNode;
    items: { id: string; name: string }[];
    expanded: boolean;
    onToggle: () => void;
}

interface SearchSidebarProps {
    leagues: League[];
    universities: University[];
    sports: Sport[];
    selectedLeague: string | null;
    selectedUniversity: string | null;
    selectedSport: string | null;
    onLeagueSelect: (id: string | null) => void;
    onUniversitySelect: (id: string | null) => void;
    onSportSelect: (id: string | null) => void;
    expandedSections: { leagues: boolean; universities: boolean; sports: boolean };
    onToggleSection: (section: 'leagues' | 'universities' | 'sports') => void;
}

const FilterItem: React.FC<{
    item: { id: string; name: string };
    isSelected: boolean;
    onClick: () => void;
}> = ({ item, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${isSelected
                ? 'bg-gradient-to-r from-unill-purple-500/30 to-unill-yellow-500/30 text-white border border-unill-yellow-400/50'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
    >
        {item.name}
    </button>
);

const CollapsibleSection: React.FC<FilterSection & { selectedId: string | null; onSelect: (id: string | null) => void }> = ({
    title,
    icon,
    items,
    expanded,
    onToggle,
    selectedId,
    onSelect,
}) => (
    <div className="mb-4">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-3 py-3 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
            <div className="flex items-center gap-2">
                {icon}
                <span>{title}</span>
                {selectedId && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-unill-yellow-400 animate-pulse" />
                )}
            </div>
            {expanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
        </button>

        {expanded && (
            <div className="space-y-1 mt-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <button
                    onClick={() => onSelect(null)}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${!selectedId
                            ? 'bg-gradient-to-r from-unill-purple-500/30 to-unill-yellow-500/30 text-white border border-unill-yellow-400/50'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    All {title}
                </button>
                {items.map((item) => (
                    <FilterItem
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        onClick={() => onSelect(item.id)}
                    />
                ))}
            </div>
        )}
    </div>
);

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
    leagues,
    universities,
    sports,
    selectedLeague,
    selectedUniversity,
    selectedSport,
    onLeagueSelect,
    onUniversitySelect,
    onSportSelect,
    expandedSections,
    onToggleSection,
}) => {
    const hasActiveFilters = selectedLeague || selectedUniversity || selectedSport;

    return (
        <div className="w-72 bg-white/5 backdrop-blur-md border-r border-white/10 h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            onLeagueSelect(null);
                            onUniversitySelect(null);
                            onSportSelect(null);
                        }}
                        className="mt-2 text-xs text-unill-yellow-400 hover:text-unill-yellow-300 transition-colors"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Filter Sections */}
            <div className="p-3">
                <CollapsibleSection
                    title="Leagues"
                    icon={<FiLayers className="w-4 h-4" />}
                    items={leagues.map(l => ({ id: l.id || '', name: l.name }))}
                    expanded={expandedSections.leagues}
                    onToggle={() => onToggleSection('leagues')}
                    selectedId={selectedLeague}
                    onSelect={onLeagueSelect}
                />

                <CollapsibleSection
                    title="Universities"
                    icon={<FiHome className="w-4 h-4" />}
                    items={universities.map(u => ({ id: u.id, name: u.name }))}
                    expanded={expandedSections.universities}
                    onToggle={() => onToggleSection('universities')}
                    selectedId={selectedUniversity}
                    onSelect={onUniversitySelect}
                />

                <CollapsibleSection
                    title="Sports"
                    icon={<FiActivity className="w-4 h-4" />}
                    items={sports.map(s => ({ id: s.id, name: s.name }))}
                    expanded={expandedSections.sports}
                    onToggle={() => onToggleSection('sports')}
                    selectedId={selectedSport}
                    onSelect={onSportSelect}
                />
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-t border-white/10 mt-auto">
                <div className="text-xs text-gray-400 space-y-1">
                    <p>{leagues.length} Leagues</p>
                    <p>{universities.length} Universities</p>
                    <p>{sports.length} Sports</p>
                </div>
            </div>
        </div>
    );
};

export default SearchSidebar;
