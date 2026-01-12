import { Fixture } from "@/models";
import { useState } from "react";
import { FixtureList } from "./FixtureList.tsx";
import { FixtureForm } from "./FixtureForm.tsx";

export const FixtureDashboard: React.FC = () => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black dark:text-white">Fixtures</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Fixture
        </button>
      </div>

      {showForm && (
        <FixtureForm
          fixture={selectedFixture}
          onClose={() => {
            setShowForm(false);
            setSelectedFixture(null);
          }}
        />
      )}

      <FixtureList
        onSelect={(fixture) => {
          setSelectedFixture(fixture);
          setShowForm(true);
        }}
      />
    </div>
  );
};