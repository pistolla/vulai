"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import CorrespondentGuard from '@/guards/CorrespondentGuard';
import { usePlayerPortfolio } from '@/hooks/usePlayerPortfolio';
import { usePlayerGallery } from '@/hooks/usePlayerGallery';
import { usePlayerTrophies } from '@/hooks/usePlayerTrophies';
import { useTrainingLogs } from '@/hooks/useTrainingLogs';
import { updatePlayerVitals, uploadPlayerImage, addPlayerTrophy, addTrainingLog } from '@/store/playerThunk';
import { FaCamera, FaTrophy, FaRunning, FaEdit } from 'react-icons/fa';
import { useClientSideLibs } from '@/utils/clientLibs';

/* ---------------------------------
   FIFA-style status colours
----------------------------------- */
const statusColours: Record<string, string> = {
  active: 'bg-green-600',
  injured: 'bg-red-600',
  suspended: 'bg-yellow-600',
  quit: 'bg-gray-600',
  shedding: 'bg-orange-500',
  massing: 'bg-blue-600',
};

export default function PlayerPage() {
  const router = useRouter();
  const playerId = router.query.id as string;

  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const isCorrespondent = user?.role === 'correspondent';

  /* real-time data */
  const player   = usePlayerPortfolio(playerId);
  const gallery  = usePlayerGallery(playerId);
  const trophies = usePlayerTrophies(playerId);
  const logs     = useTrainingLogs(playerId, 7);

  /* local UI state */
  const [editMode, setEditMode] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ height: 0, weight: 0, bodyFat: 0, status: 'active' as any, injuryNote: '' });
  const [uploading, setUploading] = useState(false);

  /* init */
  const mounted = useClientSideLibs();

  /* populate form when player loads */
  useEffect(() => {
    if (player) setVitalsForm({ height: player.height, weight: player.weight, bodyFat: player.bodyFat, status: player.status, injuryNote: player.injuryNote });
  }, [player]);

  /* handlers */
  const saveVitals = () => {
    dispatch(updatePlayerVitals({ playerId, data: vitalsForm }));
    setEditMode(false);
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    dispatch(uploadPlayerImage({ playerId, file, caption: 'New image' })).finally(() => setUploading(false));
  };

  const addTrophy = () => {
    const title = prompt('Trophy title');
    const season = prompt('Season (e.g. 2025)');
    const competition = prompt('Competition');
    if (!title || !season || !competition) return;
    dispatch(addPlayerTrophy({ playerId, trophy: { title, season, competition } }));
  };

  const addLog = () => {
    const type = prompt('Type (gym/pitch/recovery)') as any;
    const duration = parseInt(prompt('Duration (min)') || '0');
    const intensity = parseInt(prompt('Intensity (1-5)') || '3') as 1 | 2 | 3 | 4 | 5;
    const notes = prompt('Notes') || '';
    if (!type || !duration) return;
    dispatch(addTrainingLog({ playerId, log: { type, duration, intensity, notes } }));
  };

  if (!player) {
    return (
      <CorrespondentGuard>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading player data...</p>
            </div>
          </div>
        </div>
      </CorrespondentGuard>
    );
  }

  return (
    <CorrespondentGuard>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* ------- HEADER  (FIFA vibe) ------- */}
        <header className="relative h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-end justify-between h-full p-8">
            <div>
              <div className="text-5xl font-black tracking-wider">{player.name}</div>
              <div className="text-xl text-cyan-400">{player.position} • Kit #{player.kitNumber}</div>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${statusColours[player.status]}`}>
                {player.status.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Joined {mounted ? new Date(player.joinedAt).toLocaleDateString() : ''}</div>
              {isCorrespondent && (
                <button onClick={() => setEditMode(v => !v)} className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition">
                  <FaEdit /> {editMode ? 'Cancel' : 'Edit Vitals'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ------- VITALS / BODY ------- */}
        <section className="px-8 py-10 grid md:grid-cols-3 gap-8">
          {/* Body Characteristics */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Body Characteristics</h2>
            {editMode ? (
              <div className="space-y-3">
                <label className="block text-sm">Height (cm)</label>
                <input type="number" value={vitalsForm.height} onChange={e => setVitalsForm({...vitalsForm, height: +e.target.value})} className="w-full bg-white/10 rounded px-3 py-2" />
                <label className="block text-sm">Weight (kg)</label>
                <input type="number" value={vitalsForm.weight} onChange={e => setVitalsForm({...vitalsForm, weight: +e.target.value})} className="w-full bg-white/10 rounded px-3 py-2" />
                <label className="block text-sm">Body Fat (%)</label>
                <input type="number" step="0.1" value={vitalsForm.bodyFat} onChange={e => setVitalsForm({...vitalsForm, bodyFat: +e.target.value})} className="w-full bg-white/10 rounded px-3 py-2" />
                <label className="block text-sm">Status</label>
                <select value={vitalsForm.status} onChange={e => setVitalsForm({...vitalsForm, status: e.target.value as any})} className="w-full bg-white/10 rounded px-3 py-2">
                  {Object.keys(statusColours).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="block text-sm">Injury / Note</label>
                <textarea value={vitalsForm.injuryNote} onChange={e => setVitalsForm({...vitalsForm, injuryNote: e.target.value})} className="w-full bg-white/10 rounded px-3 py-2" rows={3} />
                <button onClick={saveVitals} className="w-full mt-3 bg-cyan-500 text-black font-semibold py-2 rounded hover:bg-cyan-400 transition">Save Vitals</button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Height</span><span>{player.height} cm</span></div>
                <div className="flex justify-between"><span>Weight</span><span>{player.weight} kg</span></div>
                <div className="flex justify-between"><span>Body Fat</span><span>{player.bodyFat}%</span></div>
                <div className="flex justify-between"><span>Status</span><span className={`px-2 rounded text-xs ${statusColours[player.status]}`}>{player.status}</span></div>
                {player.injuryNote && <div className="mt-2 opacity-80">Note: {player.injuryNote}</div>}
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Gallery</h2>
              {isCorrespondent && (
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded p-2 transition">
                  <FaCamera />
                  <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
                  {uploading && <span className="ml-2 text-xs">uploading…</span>}
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {gallery.map(img => (
                <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                  <img src={img.url} alt={img.caption} className="w-full h-32 object-cover rounded-lg hover:scale-105 transition" />
                </a>
              ))}
            </div>
          </div>

          {/* Trophies */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trophy Cabinet</h2>
              {isCorrespondent && (
                <button onClick={addTrophy} className="bg-white/10 hover:bg-white/20 rounded p-2 transition"><FaTrophy /></button>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {trophies.map(t => (
                <div key={t.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  {t.imageUrl && <img src={t.imageUrl} alt={t.title} className="w-12 h-12 object-cover rounded" />}
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs opacity-70">{t.competition} • {t.season}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------- TRAINING LOGS ------- */}
        <section className="px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Latest Training Logs</h2>
            {isCorrespondent && (
              <button onClick={addLog} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition"><FaRunning /> Add Log</button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map(log => (
              <div key={log.id} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-70">{mounted ? new Date(log.date).toLocaleDateString() : ''}</span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">{log.type}</span>
                </div>
                <div className="text-lg font-semibold">{log.duration} min • Intensity {log.intensity}/5</div>
                {log.notes && <div className="text-sm opacity-80 mt-2">{log.notes}</div>}
              </div>
            ))}
          </div>
        </section>

      </div>
    </CorrespondentGuard>
  );
}