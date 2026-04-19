export function getGreetingLabel(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function getDisplayName(user) {
  return (
    user?.first_name?.trim() ||
    user?.username?.trim() ||
    user?.email?.split("@")[0] ||
    "there"
  );
}

export function getSummaryLine(stats, hasError = false) {
  if (hasError) {
    return "Your dashboard layout is ready, but summary insights are temporarily unavailable.";
  }

  if (!stats) {
    return "Your category insights, activity, and closet health will fill in as the dashboard loads.";
  }

  const loggedTodayCount = stats.logged_today_count ?? 0;
  const savedOutfitsCount = stats.saved_outfits_count ?? 0;
  const closetItemsCount = stats.total_closet_items ?? 0;

  const loggedLabel =
    loggedTodayCount === 1
      ? "1 outfit logged today"
      : `${loggedTodayCount} outfits logged today`;

  return `${loggedLabel}. ${savedOutfitsCount} saved outfits and ${closetItemsCount} closet items ready to work with.`;
}

export function chunkDashboardItems(items = [], columns = 2) {
  const safeColumns = Math.max(columns, 1);
  const midpoint = Math.ceil(items.length / safeColumns);

  return [items.slice(0, midpoint), items.slice(midpoint)];
}

export function formatDashboardDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function formatDashboardWeatherSummary(weather) {
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
