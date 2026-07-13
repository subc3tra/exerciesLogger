export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

// Newest entry first. The top entry is what the "What's new" modal shows —
// bumping `version` here is what makes it pop up again for everyone.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.3',
    date: '2026-07-13',
    title: 'Update: 0.1.3',
    changes: [
      'Added a rest timer — starts counting down the moment you tick a set done, with a sound (and vibration on Android) when time is up.',
      'Rest timer length is editable at the top of your session and remembers your setting next time.',
      'Timed exercises now have a Start button: 3s countdown, then times you live and logs the result when you hit Stop.',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-07-12',
    title: "Update: 0.1.2",
    changes: [
      'Exercises now come from a shared library with clear names and descriptions.',
      'Added a timer showing how long your session has been going.',
      "Last session's numbers now prefill for real, not just as a hint.",
      'Cleaner set rows with labels on reps, weight, and duration.',
      'Added description for each exercise.'
    ],
  },
  {
    version: '0.1.0',
    date: '2026-07-06',
    title: "What's new",
    changes: [
      'NordCore is live! Log workouts with set-by-set tracking and carry-forward prefill from your last session.',
      'Dashboard shows your week-by-week progress at a glance — tap a day to see what it involves.',
      'Found a bug or have an idea? Use the 💬 button in the bottom-left corner anytime.',
    ],
  },
];
