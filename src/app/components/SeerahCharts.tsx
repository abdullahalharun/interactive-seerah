import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { Link } from "react-router-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { useThemeColors } from "@/app/hooks/useThemeColors";
import type { EventId } from "@/app/data/events";

/**
 * Estimated size of the Muslim community across the 23 years of the
 * prophetic mission. Figures are order-of-magnitude readings of the
 * classical sources, not precise censuses — see `dataNote`.
 *
 * `milestone` links a year to a timeline event, so the chart annotations
 * and their labels stay bilingual automatically.
 */
const CONVERSION_DATA: {
  year: number;
  muslims: number;
  label: string;
  milestone?: EventId;
}[] = [
  { year: 0, muslims: 1, label: "610 CE", milestone: "firstRevelation" },
  { year: 1, muslims: 10, label: "611 CE" },
  { year: 2, muslims: 30, label: "612 CE" },
  { year: 3, muslims: 40, label: "613 CE", milestone: "publicDawah" },
  { year: 4, muslims: 70, label: "614 CE" },
  { year: 5, muslims: 100, label: "615 CE", milestone: "abyssinia" },
  { year: 6, muslims: 130, label: "616 CE" },
  { year: 7, muslims: 150, label: "617 CE" },
  { year: 8, muslims: 170, label: "618 CE" },
  { year: 9, muslims: 200, label: "619 CE", milestone: "yearOfSorrow" },
  { year: 10, muslims: 250, label: "620 CE" },
  { year: 11, muslims: 300, label: "621 CE" },
  { year: 12, muslims: 400, label: "622 CE", milestone: "hijrah" },
  { year: 13, muslims: 700, label: "623 CE" },
  { year: 14, muslims: 1000, label: "624 CE", milestone: "badr" },
  { year: 15, muslims: 1500, label: "625 CE" },
  { year: 16, muslims: 2000, label: "626 CE" },
  { year: 17, muslims: 3000, label: "627 CE", milestone: "khandaq" },
  { year: 18, muslims: 4000, label: "628 CE", milestone: "hudaybiyyah" },
  { year: 19, muslims: 6000, label: "629 CE" },
  { year: 20, muslims: 10000, label: "630 CE", milestone: "conquestMakkah" },
  { year: 21, muslims: 30000, label: "631 CE" },
  {
    year: 22,
    muslims: 100000,
    label: "632 CE",
    milestone: "farewellPilgrimage",
  },
];

export function SeerahCharts() {
  const { language } = useLanguage();
  const t = translations[language].seerahCharts;
  const events = translations[language].events;
  const c = useThemeColors();
  const [scale, setScale] = useState<"log" | "linear">("log");

  const milestones = CONVERSION_DATA.filter((d) => d.milestone);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">
          {t.heading}
        </h1>
        <div className="divider-ornament my-5" aria-hidden="true" />
        <p className="mx-auto max-w-3xl text-base text-ink-muted">
          {t.description}
        </p>
      </header>

      <section className="card-manuscript p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {t.chartTitle}
          </h2>

          {/* Log vs linear matters enormously here — the log view shows
              steady growth, the linear view shows the late explosion. */}
          <div
            role="group"
            aria-label={t.scaleLabel}
            className="flex items-center gap-0.5 rounded-lg border border-rule bg-surface-sunken p-0.5"
          >
            {(
              [
                ["log", t.scaleLog],
                ["linear", t.scaleLinear],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setScale(value)}
                aria-pressed={scale === value}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  scale === value
                    ? "bg-surface text-primary shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[26rem] w-full sm:h-[32rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={CONVERSION_DATA}
              margin={{ top: 24, right: 24, left: 8, bottom: 32 }}
            >
              <CartesianGrid strokeDasharray="2 4" stroke={c.rule} />
              <XAxis
                dataKey="year"
                tick={{ fill: c["ink-muted"], fontSize: 12 }}
                stroke={c.rule}
                tickLine={false}
                label={{
                  value: t.xAxisLabel,
                  position: "insideBottom",
                  offset: -18,
                  fill: c["ink-muted"],
                  fontSize: 12,
                }}
              />
              <YAxis
                scale={scale}
                domain={scale === "log" ? [1, 100000] : [0, 100000]}
                allowDataOverflow
                tick={{ fill: c["ink-muted"], fontSize: 12 }}
                stroke={c.rule}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${v / 1000}k` : String(v)
                }
              />
              <Tooltip
                cursor={{ stroke: c.accent, strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: c.surface,
                  border: `1px solid ${c.rule}`,
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  color: c.ink,
                }}
                labelFormatter={(value: number) => {
                  const item = CONVERSION_DATA.find((d) => d.year === value);
                  if (!item) return String(value);
                  const name = item.milestone
                    ? ` · ${events[item.milestone].title}`
                    : "";
                  return `${item.label}${name}`;
                }}
                formatter={(value: number) => [
                  value.toLocaleString(language === "bn" ? "bn-BD" : "en-US"),
                  t.yAxisLabel,
                ]}
              />
              <Line
                type="monotone"
                dataKey="muslims"
                stroke={c.primary}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: c.primary }}
                name={t.yAxisLabel}
              />
              {milestones.map((m) => (
                <ReferenceDot
                  key={m.year}
                  x={m.year}
                  y={m.muslims}
                  r={4}
                  fill={c.accent}
                  stroke={c.surface}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-6 text-center text-xs italic text-ink-faint">
          {t.dataNote}
        </p>
      </section>

      {/* Milestones are derived from the timeline, so they are translated
          and clickable — each jumps to its event on the timeline. */}
      <section className="card-manuscript mt-8 p-5 sm:p-8">
        <h3 className="mb-4 font-display text-xl font-semibold text-ink">
          {t.milestonesTitle}
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {milestones.map((m) => {
            const id = m.milestone as EventId;
            return (
              <li key={id}>
                <Link
                  to={`/#${id}`}
                  className="flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary-subtle"
                >
                  <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-accent">
                    {m.label}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {events[id].title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
