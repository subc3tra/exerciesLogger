import { useState, type FormEvent } from 'react';
import { programGenerationApi, ApiError } from '../services/api';
import { ToggleTextField } from '../components/ToggleTextField';
import logo from '../assets/logo/rune-ring-edited.svg';

interface FormState {
  firstName: string;
  goal: string;
  experienceLevel: string;
  age: string;
  weight: string;
  height: string;
  availableTime: string;
  programLengthWeeks: string;
  injuriesOrLimitations: string;
  otherParallelTraining: string;
  equipmentAccess: string;
  preferredExercises: string;
  website: string; // honeypot — real users never see or fill this in
}

const initialState: FormState = {
  firstName: '',
  goal: '',
  experienceLevel: '',
  age: '',
  weight: '',
  height: '',
  availableTime: '',
  programLengthWeeks: '',
  injuriesOrLimitations: '',
  otherParallelTraining: '',
  equipmentAccess: '',
  preferredExercises: '',
  website: '',
};

// Converts a numeric-ish text input into a number for the payload, or undefined
// if left blank — every numeric field here is optional on the backend.
function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Same idea for optional free-text fields — an empty string means "not answered",
// so send undefined rather than an empty value.
function toOptionalString(value: string): string | undefined {
  return value.trim() === '' ? undefined : value;
}

export function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await programGenerationApi.submitIntake({
        firstName: form.firstName,
        goal: form.goal,
        experienceLevel: form.experienceLevel,
        age: toOptionalNumber(form.age),
        weight: toOptionalNumber(form.weight),
        height: toOptionalNumber(form.height),
        availableTime: form.availableTime,
        programLengthWeeks: toOptionalNumber(form.programLengthWeeks),
        injuriesOrLimitations: toOptionalString(form.injuriesOrLimitations),
        otherParallelTraining: toOptionalString(form.otherParallelTraining),
        equipmentAccess: toOptionalString(form.equipmentAccess),
        preferredExercises: toOptionalString(form.preferredExercises),
        website: form.website,
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="intake-page">
        <div className="intake-glow" />
        <div className="intake-card intake-success">
          <img src={logo} alt="Ironset" className="login-logo" />
          <h1 className="intake-title">Thanks!</h1>
          <p className="intake-subtitle">
            Your answers are in. Your training program will be put together from here — you'll get
            a link to review it once it's ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="intake-page">
      <div className="intake-glow" />
      <form className="intake-card" onSubmit={handleSubmit}>
        <img src={logo} alt="Ironset" className="login-logo" />
        <h1 className="intake-title">Tell us about you</h1>
        <p className="intake-subtitle">
          A few questions so your training program actually fits you.
        </p>

        {/* Honeypot — visually hidden, never shown to a real visitor */}
        <div className="intake-honeypot" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>

        <label className="intake-label" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          className="intake-input"
          type="text"
          value={form.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          required
        />

        <label className="intake-label" htmlFor="goal">
          What's your main goal?
        </label>
        <input
          id="goal"
          className="intake-input"
          type="text"
          placeholder="e.g. build muscle, lose weight, get stronger"
          value={form.goal}
          onChange={(e) => updateField('goal', e.target.value)}
          required
        />

        <label className="intake-label" htmlFor="experienceLevel">
          Training experience
        </label>
        <input
          id="experienceLevel"
          className="intake-input"
          type="text"
          placeholder="e.g. beginner, or experienced in martial arts"
          value={form.experienceLevel}
          onChange={(e) => updateField('experienceLevel', e.target.value)}
          required
        />

        <label className="intake-label" htmlFor="availableTime">
          Available time
        </label>
        <input
          id="availableTime"
          className="intake-input"
          type="text"
          placeholder="e.g. 3 days/week, ~1 hour per session"
          value={form.availableTime}
          onChange={(e) => updateField('availableTime', e.target.value)}
          required
        />

        <label className="intake-label" htmlFor="programLengthWeeks">
          How many weeks should the program run? (optional)
        </label>
        <input
          id="programLengthWeeks"
          className="intake-input"
          type="number"
          min={1}
          value={form.programLengthWeeks}
          onChange={(e) => updateField('programLengthWeeks', e.target.value)}
        />

        <label className="intake-label" htmlFor="age">
          Age (optional)
        </label>
        <input
          id="age"
          className="intake-input"
          type="number"
          min={1}
          value={form.age}
          onChange={(e) => updateField('age', e.target.value)}
        />

        <label className="intake-label" htmlFor="weight">
          Weight, kg (optional)
        </label>
        <input
          id="weight"
          className="intake-input"
          type="number"
          min={1}
          value={form.weight}
          onChange={(e) => updateField('weight', e.target.value)}
        />

        <label className="intake-label" htmlFor="height">
          Height, cm (optional)
        </label>
        <input
          id="height"
          className="intake-input"
          type="number"
          min={1}
          value={form.height}
          onChange={(e) => updateField('height', e.target.value)}
        />

        <ToggleTextField
          id="injuriesOrLimitations"
          question="Any injuries or limitations?"
          placeholder="Which joint/tendon, what hurts, what's ok"
          value={form.injuriesOrLimitations}
          onChange={(v) => updateField('injuriesOrLimitations', v)}
        />

        <ToggleTextField
          id="otherParallelTraining"
          question="Doing any other training right now?"
          placeholder="e.g. martial arts, team sport"
          value={form.otherParallelTraining}
          onChange={(v) => updateField('otherParallelTraining', v)}
        />

        <ToggleTextField
          id="equipmentAccess"
          question="Anything specific about your equipment/gym access?"
          placeholder="e.g. home gym, dumbbells only, full commercial gym"
          value={form.equipmentAccess}
          onChange={(v) => updateField('equipmentAccess', v)}
        />

        <ToggleTextField
          id="preferredExercises"
          question="Any favorite or off-limits exercises?"
          placeholder="Exercises you want included, or want to avoid"
          value={form.preferredExercises}
          onChange={(v) => updateField('preferredExercises', v)}
        />

        {error && <p className="intake-error">{error}</p>}

        <button className="intake-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
