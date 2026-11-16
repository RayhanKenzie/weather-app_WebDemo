const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CACHE_TTL = 5 * 60 * 1000;
const weatherCache = new Map();

export const DEFAULT_CITY = {
  id: "jakarta",
  name: "Jakarta",
  country: "Indonesia",
  countryCode: "ID",
  region: "Daerah Khusus Ibukota Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
};

export const POPULAR_CITIES = [
  DEFAULT_CITY,
  { id: "bandung", name: "Bandung", country: "Indonesia", countryCode: "ID", region: "Jawa Barat", latitude: -6.9175, longitude: 107.6191, timezone: "Asia/Jakarta" },
  { id: "surabaya", name: "Surabaya", country: "Indonesia", countryCode: "ID", region: "Jawa Timur", latitude: -7.2575, longitude: 112.7521, timezone: "Asia/Jakarta" },
  { id: "bali", name: "Bali", country: "Indonesia", countryCode: "ID", region: "Bali", latitude: -8.4095, longitude: 115.1889, timezone: "Asia/Makassar" },
  { id: "yogyakarta", name: "Yogyakarta", country: "Indonesia", countryCode: "ID", region: "DI Yogyakarta", latitude: -7.7956, longitude: 110.3695, timezone: "Asia/Jakarta" },
  { id: "medan", name: "Medan", country: "Indonesia", countryCode: "ID", region: "Sumatera Utara", latitude: 3.5952, longitude: 98.6722, timezone: "Asia/Jakarta" },
];

const WEATHER = {
  0: { kind: "clear", icon: "sun", en: "Clear sky", id: "Cerah", shortEn: "Sunny", shortId: "Cerah" },
  1: { kind: "mostly-clear", icon: "mostly-clear", en: "Mainly clear", id: "Umumnya cerah", shortEn: "Mostly sunny", shortId: "Cerah berawan" },
  2: { kind: "partly-cloudy", icon: "partly-cloudy", en: "Partly cloudy", id: "Berawan sebagian", shortEn: "Partly cloudy", shortId: "Berawan sebagian" },
  3: { kind: "overcast", icon: "cloud", en: "Overcast", id: "Mendung", shortEn: "Overcast", shortId: "Mendung" },
  45: { kind: "fog", icon: "fog", en: "Fog", id: "Kabut", shortEn: "Foggy", shortId: "Berkabut" },
  48: { kind: "fog", icon: "fog", en: "Depositing rime fog", id: "Kabut beku", shortEn: "Foggy", shortId: "Berkabut" },
  51: { kind: "drizzle", icon: "rain", en: "Light drizzle", id: "Gerimis ringan", shortEn: "Drizzle", shortId: "Gerimis" },
  53: { kind: "drizzle", icon: "rain", en: "Moderate drizzle", id: "Gerimis sedang", shortEn: "Drizzle", shortId: "Gerimis" },
  55: { kind: "drizzle", icon: "rain", en: "Dense drizzle", id: "Gerimis lebat", shortEn: "Drizzle", shortId: "Gerimis" },
  56: { kind: "drizzle", icon: "rain", en: "Light freezing drizzle", id: "Gerimis beku ringan", shortEn: "Drizzle", shortId: "Gerimis" },
  57: { kind: "drizzle", icon: "rain", en: "Dense freezing drizzle", id: "Gerimis beku lebat", shortEn: "Drizzle", shortId: "Gerimis" },
  61: { kind: "rain", icon: "rain", en: "Slight rain", id: "Hujan ringan", shortEn: "Light rain", shortId: "Hujan ringan" },
  63: { kind: "rain", icon: "rain", en: "Moderate rain", id: "Hujan sedang", shortEn: "Rainy", shortId: "Hujan" },
  65: { kind: "heavy-rain", icon: "rain", en: "Heavy rain", id: "Hujan lebat", shortEn: "Heavy rain", shortId: "Hujan lebat" },
  66: { kind: "drizzle", icon: "rain", en: "Light freezing rain", id: "Hujan beku ringan", shortEn: "Freezing rain", shortId: "Hujan beku" },
  67: { kind: "rain", icon: "rain", en: "Heavy freezing rain", id: "Hujan beku lebat", shortEn: "Freezing rain", shortId: "Hujan beku" },
  71: { kind: "snow", icon: "snow", en: "Slight snowfall", id: "Salju ringan", shortEn: "Light snow", shortId: "Salju ringan" },
  73: { kind: "snow", icon: "snow", en: "Moderate snowfall", id: "Salju sedang", shortEn: "Snowy", shortId: "Bersalju" },
  75: { kind: "snow", icon: "snow", en: "Heavy snowfall", id: "Salju lebat", shortEn: "Heavy snow", shortId: "Salju lebat" },
  77: { kind: "snow", icon: "snow", en: "Snow grains", id: "Butiran salju", shortEn: "Snowy", shortId: "Bersalju" },
  80: { kind: "rain", icon: "rain", en: "Slight rain showers", id: "Hujan singkat ringan", shortEn: "Showers", shortId: "Hujan singkat" },
  81: { kind: "rain", icon: "rain", en: "Moderate rain showers", id: "Hujan singkat sedang", shortEn: "Showers", shortId: "Hujan singkat" },
  82: { kind: "heavy-rain", icon: "rain", en: "Violent rain showers", id: "Hujan singkat sangat lebat", shortEn: "Heavy showers", shortId: "Hujan lebat" },
  85: { kind: "snow", icon: "snow", en: "Slight snow showers", id: "Hujan salju ringan", shortEn: "Snow showers", shortId: "Hujan salju" },
  86: { kind: "snow", icon: "snow", en: "Heavy snow showers", id: "Hujan salju lebat", shortEn: "Snow showers", shortId: "Hujan salju" },
  95: { kind: "thunder", icon: "thunder", en: "Thunderstorm", id: "Badai petir", shortEn: "Thunderstorm", shortId: "Badai petir" },
  96: { kind: "thunder", icon: "thunder", en: "Thunderstorm with hail", id: "Badai petir dan hujan es", shortEn: "Thunderstorm", shortId: "Badai petir" },
  97: { kind: "thunder", icon: "thunder", en: "Heavy thunderstorm", id: "Badai petir kuat", shortEn: "Thunderstorm", shortId: "Badai petir" },
  99: { kind: "thunder", icon: "thunder", en: "Heavy thunderstorm with hail", id: "Badai petir kuat dan hujan es", shortEn: "Thunderstorm", shortId: "Badai petir" },
};

const FALLBACK_WEATHER = {
  kind: "partly-cloudy",
  icon: "partly-cloudy",
  en: "Partly cloudy",
  id: "Berawan sebagian",
  shortEn: "Partly cloudy",
  shortId: "Berawan sebagian",
};

export function describeWeather(code, language = "en") {
  const descriptor = WEATHER[code] ?? FALLBACK_WEATHER;
  return {
    kind: descriptor.kind,
    icon: descriptor.icon,
    label: language === "id" ? descriptor.id : descriptor.en,
    short: language === "id" ? descriptor.shortId : descriptor.shortEn,
  };
}

async function requestJson(url, signal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

function stableCityId(name, countryCode, latitude, longitude) {
  const normalized = name.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${normalized}-${countryCode || "unknown"}-${latitude.toFixed(3)}-${longitude.toFixed(3)}`;
}

function mapGeocodingResult(result) {
  if (!result || typeof result.name !== "string" || !Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) return null;
  const countryCode = typeof result.country_code === "string" ? result.country_code : "";
  return {
    id: Number.isFinite(result.id) ? `geo-${result.id}` : stableCityId(result.name, countryCode, result.latitude, result.longitude),
    name: result.name,
    country: typeof result.country === "string" ? result.country : "",
    countryCode,
    region: typeof result.admin1 === "string" ? result.admin1 : "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: typeof result.timezone === "string" ? result.timezone : "UTC",
  };
}

export async function searchCities(query, language = "en", signal) {
  const term = query.trim();
  if (term.length < 2) return [];
  const params = new URLSearchParams({
    name: term,
    count: "10",
    language,
    format: "json",
  });
  const payload = await requestJson(`${GEOCODING_URL}?${params}`, signal);
  if (payload.error) throw new Error(payload.reason || "City search failed");
  return Array.isArray(payload.results) ? payload.results.map(mapGeocodingResult).filter(Boolean) : [];
}

export function searchPopularCities(query) {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return [];
  return POPULAR_CITIES.filter((city) => `${city.name} ${city.country} ${city.region}`.toLocaleLowerCase().includes(term));
}

function readNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function requireArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`Weather response is missing ${name}`);
  return value;
}

export async function fetchCityWeather(city, { fresh = false } = {}) {
  const cacheKey = `${city.latitude.toFixed(3)}:${city.longitude.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (!fresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.data;

  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "weather_code", "uv_index", "visibility", "wind_speed_10m", "wind_direction_10m"].join(","),
    hourly: ["temperature_2m", "weather_code", "precipitation_probability", "is_day"].join(","),
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max", "uv_index_max"].join(","),
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const payload = await requestJson(`${FORECAST_URL}?${params}`);
  const current = payload.current;
  const hourly = payload.hourly;
  const daily = payload.daily;

  if (!current || !hourly || !daily || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code)) {
    throw new Error("Weather response is incomplete");
  }
  const hourTimes = requireArray(hourly.time, "hourly times");
  const hourTemperatures = requireArray(hourly.temperature_2m, "hourly temperatures");
  const hourCodes = requireArray(hourly.weather_code, "hourly weather codes");
  const dayTimes = requireArray(daily.time, "daily dates");
  const dayMaximums = requireArray(daily.temperature_2m_max, "daily maximum temperatures");
  const dayMinimums = requireArray(daily.temperature_2m_min, "daily minimum temperatures");

  const currentHour = hourTimes.findIndex((time) => time.slice(0, 13) === current.time.slice(0, 13));
  const startIndex = currentHour >= 0 ? currentHour : 0;
  const normalizedHourly = hourTimes.slice(startIndex, startIndex + 24).map((time, index) => ({
    time,
    temperature: readNumber(hourTemperatures[startIndex + index]),
    weatherCode: readNumber(hourCodes[startIndex + index]),
    precipitationProbability: readNumber(hourly.precipitation_probability?.[startIndex + index]),
    isDay: readNumber(hourly.is_day?.[startIndex + index]) === 1,
  }));
  if (normalizedHourly.length === 0 || normalizedHourly.some((item) => item.temperature === null || item.weatherCode === null)) {
    throw new Error("Weather response has incomplete hourly data");
  }

  const normalizedDaily = dayTimes.slice(0, 7).map((date, index) => ({
    date,
    weatherCode: readNumber(daily.weather_code?.[index]),
    maximum: readNumber(dayMaximums[index]),
    minimum: readNumber(dayMinimums[index]),
    precipitationProbability: readNumber(daily.precipitation_probability_max?.[index]),
    uvIndex: readNumber(daily.uv_index_max?.[index]),
  })).filter((day) => day.maximum !== null && day.minimum !== null && day.weatherCode !== null);
  if (normalizedDaily.length === 0) throw new Error("Weather response has incomplete daily data");

  const data = {
    city: { ...city, timezone: payload.timezone || city.timezone || "UTC" },
    timezone: payload.timezone || city.timezone || "UTC",
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      feelsLike: readNumber(current.apparent_temperature),
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      humidity: readNumber(current.relative_humidity_2m),
      precipitation: readNumber(current.precipitation),
      uvIndex: readNumber(current.uv_index),
      visibility: readNumber(current.visibility),
      windSpeed: readNumber(current.wind_speed_10m),
      windDirection: readNumber(current.wind_direction_10m),
    },
    hourly: normalizedHourly,
    daily: normalizedDaily,
    fetchedAt: new Date().toISOString(),
  };
  weatherCache.set(cacheKey, { data, fetchedAt: Date.now() });
  return data;
}

function hash(value) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
}

function localParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map(({ type, value }) => [type, value]));
}

function rounded(value, places = 0) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function buildSampleWeather(city, now = new Date()) {
  let seed = hash(`${city.name}-${city.latitude.toFixed(2)}-${city.longitude.toFixed(2)}`) || 1;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const timeZone = city.timezone || "UTC";
  const nowParts = localParts(now, timeZone);
  const base = 27 - Math.abs(city.latitude) * 0.18 + (random() - 0.5) * 4;
  const currentCode = [0, 1, 2, 3, 61, 80, 95][Math.floor(random() * 7)];
  const currentHour = Number(nowParts.hour);
  const localTime = `${nowParts.year}-${nowParts.month}-${nowParts.day}T${nowParts.hour}:${nowParts.minute}`;
  const hourly = Array.from({ length: 24 }, (_, index) => {
    const at = new Date(now.getTime() + index * 60 * 60 * 1000);
    const parts = localParts(at, timeZone);
    const hour = Number(parts.hour);
    return {
      time: `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`,
      temperature: rounded(base + Math.sin(((hour - 9) / 24) * Math.PI * 2) * 3.2 + (random() - 0.5)),
      weatherCode: [0, 1, 2, 3, 61, 80][Math.floor(random() * 6)],
      precipitationProbability: Math.round(random() * 45),
      isDay: hour >= 6 && hour < 18,
    };
  });
  const date = new Date(Date.UTC(Number(nowParts.year), Number(nowParts.month) - 1, Number(nowParts.day)));
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date.getTime() + index * 86400000).toISOString().slice(0, 10);
    const variation = random() * 2.4;
    return {
      date: day,
      weatherCode: [0, 1, 2, 3, 61, 80, 95][Math.floor(random() * 7)],
      maximum: rounded(base + 3 + variation),
      minimum: rounded(base - 3 - variation),
      precipitationProbability: Math.round(random() * 55),
      uvIndex: rounded((currentHour >= 6 && currentHour < 18 ? 4 : 0) + random() * 3, 1),
    };
  });

  return {
    city,
    timezone: timeZone,
    current: {
      time: localTime,
      temperature: rounded(base + (currentHour >= 6 && currentHour < 18 ? 1 : -1)),
      feelsLike: rounded(base + 2),
      weatherCode: currentCode,
      isDay: currentHour >= 6 && currentHour < 18,
      humidity: Math.round(58 + random() * 34),
      precipitation: rounded(random() * 1.4, 1),
      uvIndex: rounded((currentHour >= 6 && currentHour < 18 ? 4 : 0) + random() * 3, 1),
      visibility: Math.round((6 + random() * 9) * 1000),
      windSpeed: rounded(4 + random() * 16),
      windDirection: Math.round(random() * 360),
    },
    hourly,
    daily,
    fetchedAt: now.toISOString(),
  };
}
