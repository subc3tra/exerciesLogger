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
    version: '1.0.0',
    date: '2026-07-06',
    title: "What's new",
    changes: [
      'NordCore is live! Log workouts with set-by-set tracking and carry-forward prefill from your last session.',
      'Dashboard shows your week-by-week progress at a glance — tap a day to see what it involves.',
      'Found a bug or have an idea? Use the 💬 button in the bottom-left corner anytime.',
    ],
  },
];
