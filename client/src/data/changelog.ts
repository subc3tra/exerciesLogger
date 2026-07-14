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
    version: '0.1.4',
    date: '2026-07-14',
    title: 'Update: 0.1.4',
    changes: [
      'Exercises that need two numbers at once (like duration + distance, or distance + weight) now support both — no more picking just one.',
      'Cardio machines (Rowing Machine, Stationary Bike, Treadmill, Stairclimber) now log distance alongside duration.',
      'Added Sled Push/Pull, tracked by distance and weight together.',
      'Exercise library grew by 10: Dips, Leg Press, Seated Leg Curl, Farmers Carry, Plank, Cable Crunch, Chin-Up, Shrugs, and Hammer Curl.',
    ],
  },
  {
    version: '0.1.3',
    date: '2026-07-13',
    title: 'Update: 0.1.3',
    changes: [
      'Added a rest timer — starts counting down the moment you tick a set done, with a sound (and vibration on Android) when time is up.',
      'Rest timer length is editable at the top of your session and remembers your setting next time.',
      'Timed exercises now have a Start button: 3s countdown, then times you live and logs the result when you hit Stop.',
      'Dashboard now shows a stats summary: total weight lifted, your heaviest lift, and sessions completed.',
      'Moved the feedback chat bubble to the bottom-right so it no longer overlaps the Complete Session button.',
      'Cleaned up the Dashboard layout with clear section headers for Stats and Programs.',
    ],
  },
  {
    version: '0.1.2',
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
