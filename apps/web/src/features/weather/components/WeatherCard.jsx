"use client";

import Card from "../../../app/components/ui/Card/Card";
import styles from "./WeatherCard.module.scss";

function formatTemperature(value) {
  return typeof value === "number" ? `${Math.round(value)}°C` : "N/A";
}

function formatWind(value) {
  return typeof value === "number" ? `${Math.round(value)} km/h` : "N/A";
}

function getLocationLabel(user) {
  return [user?.city, user?.state, user?.country].filter(Boolean).join(", ");
}

function getDayLabel(isDay) {
  if (isDay === true) {
    return "Daytime";
  }

  if (isDay === false) {
    return "Nighttime";
  }

  return "Local time";
}

export default function WeatherCard({
  user,
  weather,
  isLoading,
  isError,
}) {
  const locationLabel = getLocationLabel(user);
  const hasCoordinates =
    typeof user?.latitude === "number" && typeof user?.longitude === "number";

  return (
    <Card title="Current Weather" className={styles.card}>
      {!hasCoordinates ? (
        <p className={styles.empty}>Add your location to see weather.</p>
      ) : isLoading ? (
        <p className={styles.loading}>Loading current weather...</p>
      ) : isError || !weather ? (
        <p className={styles.error}>
          Weather is unavailable right now. Please try again shortly.
        </p>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Right now</p>
              <p className={styles.location}>{locationLabel || "Saved location"}</p>
              <p className={styles.condition}>{weather.weather_label}</p>
            </div>

            <div className={styles.tempBlock}>
              <p className={styles.temperature}>
                {formatTemperature(weather.temperature)}
              </p>
              <span className={styles.dayBadge}>{getDayLabel(weather.is_day)}</span>
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detail}>
              <p className={styles.detailLabel}>Feels like</p>
              <p className={styles.detailValue}>
                {formatTemperature(weather.feels_like)}
              </p>
            </div>
            <div className={styles.detail}>
              <p className={styles.detailLabel}>Wind speed</p>
              <p className={styles.detailValue}>{formatWind(weather.wind_speed)}</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
