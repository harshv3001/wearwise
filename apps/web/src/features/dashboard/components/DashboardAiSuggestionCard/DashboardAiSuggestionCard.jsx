"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/actions";
import { Card } from "@/app/components/ui/display";
import { Skeleton } from "@/app/components/ui/feedback";
import { SelectInput } from "@/app/components/ui/forms";
import { OCCASION_OPTIONS } from "@/lib/static-data";
import styles from "./DashboardAiSuggestionCard.module.scss";

const STATIC_SUGGESTION_ITEMS = [
  { name: "T-shirt", category: "Top" },
  { name: "Raincoat", category: "Outerwear" },
  { name: "Jeans", category: "Bottom" },
  { name: "Boots", category: "Shoes" },
];

const STATIC_NOTES = [
  "Cold weather makes layering a safer pick.",
  "A rain-ready outer layer keeps this outfit practical.",
  "Your low-rotation boots could use a wear soon.",
];

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatWeatherSummary(weather) {
  if (!weather) {
    return "Weather details will help guide smarter outfit suggestions.";
  }

  const temperature =
    typeof weather.temperature === "number"
      ? `${Math.round(weather.temperature)}°C`
      : "N/A";
  const feelsLike =
    typeof weather.feels_like === "number"
      ? `${Math.round(weather.feels_like)}°C`
      : "N/A";

  return `${temperature} • ${weather.weather_label || "Current conditions"} • Feels like ${feelsLike}`;
}

export default function DashboardAiSuggestionCard({
  weather,
  isWeatherLoading = false,
  isWeatherError = false,
}) {
  const [occasion, setOccasion] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const weatherSummary = useMemo(() => {
    if (isWeatherError) {
      return "Weather is unavailable right now, but AI suggestions are still coming soon.";
    }

    return formatWeatherSummary(weather);
  }, [isWeatherError, weather]);

  return (
    <Card
      title={
        <span className={styles.title}>
          <span className="material-symbols-outlined">auto_awesome</span>
          AI suggestion outfit
        </span>
      }
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
    >
      <div className={styles.controls}>
        <div className={styles.inputLike}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span>{formatDateTime(now)}</span>
        </div>

        <SelectInput
          name="dashboard-ai-occasion"
          value={occasion}
          onChange={(event) => setOccasion(event.target.value)}
          options={OCCASION_OPTIONS}
          placeholder="Select occasion"
          className={styles.selectWrap}
          selectClassName={styles.select}
        />
      </div>

      <div className={styles.weatherLine}>
        <span className="material-symbols-outlined">partly_cloudy_day</span>
        {isWeatherLoading ? (
          <Skeleton variant="text" width="72%" height={22} />
        ) : (
          <span>{weatherSummary}</span>
        )}
      </div>

      <div className={styles.previewBox}>
        <button type="button" className={styles.arrowButton} disabled>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className={styles.previewItems}>
          {STATIC_SUGGESTION_ITEMS.map((item) => (
            <div key={item.name} className={styles.previewItem}>
              <div className={styles.previewThumb} />
              <div className={styles.previewName}>{item.name}</div>
              <div className={styles.previewCategory}>{item.category}</div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.arrowButton} disabled>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <ul className={styles.noteList}>
        {STATIC_NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button type="button" variant="tertiary" size="sm" disabled>
          Use This Outfit
        </Button>
        <Button type="button" variant="tertiary" size="sm" disabled>
          Refresh
        </Button>
      </div>
    </Card>
  );
}
