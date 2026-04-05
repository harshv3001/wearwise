import { http } from "../../../lib/http";

export async function getCurrentWeatherApi({ latitude, longitude, signal }) {
  const res = await http.get("/weather/current", {
    signal,
    params: {
      latitude,
      longitude,
    },
  });

  return res.data;
}
