import { useEffect, useState } from 'react';
import { exercisesApi } from '../services/api';
import { StatsSummary } from '../components/StatsSummary';
import { ProgressionChart } from '../components/ProgressionChart';
import type { ExerciseRef } from '../types';

export function Progression() {
  const [exercises, setExercises] = useState<ExerciseRef[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    exercisesApi
      .list()
      .then((res) => setExercises(res.exercises))
      .catch(() => {
        // exercise list is secondary — a failure here shouldn't block the page
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Progression</h1>

      <select
        className="exercise-select"
        value={selectedId ?? ''}
        onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Select an exercise…</option>
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 20 }}>
        <StatsSummary exerciseId={selectedId ?? undefined} />
      </div>

      <div style={{ marginTop: 20 }}>
        <ProgressionChart exerciseId={selectedId ?? undefined} />
      </div>
    </div>
  );
}
