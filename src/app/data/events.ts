import { translations } from "@/app/translations/translations";

/**
 * The single ordered source of truth for the timeline.
 *
 * Every event id here must exist under `translations.<lang>.events`.
 * The timeline, the navbar menus and the chart annotations all derive
 * from this array — add an event once and it appears everywhere.
 */
export const EVENT_IDS = [
  "birth",
  "childhood",
  "orphan",
  "youth",
  "marriage",
  "kaaba",
  "firstRevelation",
  "secretDawah",
  "publicDawah",
  "persecution",
  "abyssinia",
  "hamzaUmar",
  "boycott",
  "yearOfSorrow",
  "taif",
  "isra",
  "pledges",
  "hijrah",
  "masjidNabawi",
  "brotherhood",
  "constitution",
  "qiblah",
  "badr",
  "uhud",
  "banuNadir",
  "banuMustaliq",
  "ifk",
  "khandaq",
  "banuQurayzah",
  "hudaybiyyah",
  "khaybar",
  "lettersToKings",
  "mutah",
  "umrahQada",
  "conquestMakkah",
  "hunayn",
  "siegeTaif",
  "tabuk",
  "yearOfDelegations",
  "farewellPilgrimage",
  "farewellSermon",
  "deathOfProphet",
] as const;

export type EventId = (typeof EVENT_IDS)[number];

/** The Hijrah splits the Seerah into its two great chapters. */
export const HIJRAH_INDEX = EVENT_IDS.indexOf("hijrah");

export type Period = "makkah" | "madinah";

export function periodOf(id: EventId): Period {
  return EVENT_IDS.indexOf(id) < HIJRAH_INDEX ? "makkah" : "madinah";
}

export interface SeerahEvent {
  id: EventId;
  year: string;
  date?: string;
  age?: string;
  title: string;
  location: string;
  description: string;
  details: string[];
  period: Period;
  isFirst: boolean;
}

type Language = keyof typeof translations;

/** Resolve the ordered event list for a language. */
export function getEvents(language: Language): SeerahEvent[] {
  const events = translations[language].events;

  return EVENT_IDS.map((id, index) => ({
    ...events[id],
    id,
    period: periodOf(id),
    isFirst: index === 0,
  }));
}
