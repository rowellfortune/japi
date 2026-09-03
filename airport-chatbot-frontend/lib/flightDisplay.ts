// Shared presentation helpers for anywhere a flight is shown as a card or detail view
// (components/chat/FlightCards.tsx, app/flights/detail).

const BADGE_COLORS = ['bg-indigo-600', 'bg-red-600', 'bg-amber-600', 'bg-emerald-600', 'bg-sky-600', 'bg-fuchsia-600', 'bg-orange-600', 'bg-teal-600'];

// Deterministic color per airline/terminal name, so the same one always renders the same badge
// color without needing a curated lookup table.
export function colorFor(seed: string): string {
  const hash = Array.from(seed).reduce((h, c) => h + c.charCodeAt(0), 0);
  return BADGE_COLORS[hash % BADGE_COLORS.length];
}

// Public logo lookup by IATA airline code (AirHex's free, no-key logo endpoint — used widely by
// travel apps for exactly this). Not guaranteed to have every airline; callers must handle the
// image failing to load (e.g. fall back to the colored initials badge from colorFor above).
export function airlineLogoUrl(iataCode: string): string {
  return `https://content.airhex.com/content/logos/airlines_${iataCode.toUpperCase()}_100_100_s.png?background=fff`;
}

// Flight numbers are stored as one token (e.g. "KL713"); split into the 2-character IATA
// airline code and the trailing flight number so it displays the way passengers expect
// ("KL 713"). IATA airline codes are always exactly 2 characters — letters, digits, or a mix
// ("KL", "W8", "G3") — never 1 or 3, so a fixed-width split is correct, not a digit-boundary
// regex (that misreads "KL713" as "KL7"+"13" whenever the code itself ends before a digit).
export function splitFlightNumber(flightNumber: string): { code: string; num: string } {
  if (flightNumber.length <= 2) return { code: flightNumber, num: '' };
  return { code: flightNumber.slice(0, 2), num: flightNumber.slice(2) };
}

export interface TimeDelta {
  /** Positive = later than scheduled (delayed), negative = earlier than scheduled. */
  minutes: number;
  isDelayed: boolean;
  isEarly: boolean;
  /** e.g. "10min late" / "2min early" — null when the difference is too small to bother showing. */
  label: string | null;
}

// Below this, a difference is just clock-rounding noise, not a real schedule change.
const DELTA_THRESHOLD_MINUTES = 1;

// Compares a flight's current (possibly actual) time against its original scheduled time —
// see the backend's models/Flight.ts for how scheduledDepartureTime/scheduledArrivalTime get
// set once and never overwritten by the FR24 sync, so this only fires when a real discrepancy
// exists. Returns null when there's nothing to compare (no scheduled baseline recorded, e.g. for
// flights that predate this field, or that FR24 first saw already in progress).
export function getTimeDelta(scheduledIso: string | null, currentIso: string): TimeDelta | null {
  if (!scheduledIso) return null;
  const diffMs = new Date(currentIso).getTime() - new Date(scheduledIso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < DELTA_THRESHOLD_MINUTES) {
    return { minutes, isDelayed: false, isEarly: false, label: null };
  }
  const isDelayed = minutes > 0;
  return {
    minutes,
    isDelayed,
    isEarly: !isDelayed,
    label: isDelayed ? `${minutes}min late` : `${-minutes}min early`,
  };
}
