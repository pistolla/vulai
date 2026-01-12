import { Fixture, Match, League } from "@/models";
import { useState } from "react";
import { FixtureList } from "./FixtureList.tsx";
import { FixtureForm } from "./FixtureForm.tsx";

export const FixtureDashboard: React.FC = () => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black dark:text-white">Fixtures</h3>
        <button
          onClick={() => {
            setSelectedMatch(null);
            setSelectedLeague(null);
            setSelectedFixture(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Fixture
        </button>
      </div>

      {showForm && (
        <FixtureForm
          fixture={selectedFixture}
          match={selectedMatch}
          league={selectedLeague}
          onClose={() => {
            setShowForm(false);
            setSelectedFixture(null);
            setSelectedMatch(null);
            setSelectedLeague(null);
          }}
        />
      )}

      <FixtureList
        onSelect={(match, league) => {
          setSelectedMatch(match);
          setSelectedLeague(league);
          setSelectedFixture(null);
          setShowForm(true);
        }}
      />
    </div>
  );
};