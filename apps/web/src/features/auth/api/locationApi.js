import { http } from "../../../lib/http";

export const locationQueryKeys = {
  countries: ["locations", "countries"],
  states: (country) => ["locations", "states", country || ""],
  citySearch: ({ query, country, state, countryCode, stateCode }) => [
    "locations",
    "cities",
    query || "",
    country || "",
    state || "",
    countryCode || "",
    stateCode || "",
  ],
};

export async function getCountriesApi() {
  const res = await http.get("/locations/countries");
  return res.data;
}

export async function getStatesApi(country) {
  const res = await http.get("/locations/states", {
    params: { country },
  });
  return res.data;
}

export async function searchCitiesApi({
  query,
  country,
  state,
  countryCode,
  stateCode,
  signal,
}) {
  const res = await http.get("/locations/cities/search", {
    signal,
    params: {
      q: query,
      country,
      state: state || undefined,
      country_code: countryCode || undefined,
      state_code: stateCode || undefined,
    },
  });

  return res.data;
}
