import {
  DEFAULT_CITY,
  POPULAR_CITIES,
  buildSampleWeather,
  describeWeather,
  fetchCityWeather,
  searchCities,
  searchPopularCities,
} from "./weather-service.js";

const STORAGE = {
  city: "weatherly.demo.city.v1",
  favorites: "weatherly.demo.favorites.v1",
  settings: "weatherly.demo.settings.v1",
};
const MAX_FAVORITES = 8;
const TEXT = {
  en: {
    navOverview: "Overview", navHourly: "Hourly", navForecast: "7-day", navDetails: "Details",
    checkingData: "Checking forecast", liveData: "Live Data", simulatedData: "Simulated Data",
    dashboardEyebrow: "Weather, at a glance", searchLabel: "Search for a city", searchPlaceholder: "Search a city or region…", searchSubmit: "Search",
    settings: "Preferences", close: "Close preferences", temperatureUnit: "Temperature unit", language: "Language", appearance: "Appearance",
    light: "Light", dark: "Dark", system: "System", celsius: "Celsius", fahrenheit: "Fahrenheit",
    alerts: "Alert preferences", severeAlert: "Severe weather", rainAlert: "Rain forecast", dailyAlert: "Daily forecast",
    alertsNote: "Preferences are saved on this device. This demo does not send browser notifications.",
    currentConditions: "Current conditions", feelsLike: "Feels like", todayHigh: "Today high", todayLow: "Today low", saveCity: "Save city", removeCity: "Remove from favorites", saved: "Saved",
    hourlyTitle: "Hourly forecast", next24: "NEXT 24 HOURS", temperatureTrend: "Temperature trend", basedOnForecast: "Based on the forecast for this location", sevenDay: "7-day forecast", dailyOutlook: "DAILY OUTLOOK", details: "Weather details", now: "Now", today: "Today",
    uvIndex: "UV index", humidity: "Humidity", wind: "Wind", visibility: "Visibility", precipitation: "Precipitation (recent)", max: "High", min: "Low", precipChance: "Rain chance", noValue: "Not available",
    myPlaces: "Saved places", favoritesCount: "{count} / 8", addCurrent: "Save current city", emptyFavorites: "No saved cities yet. Save this city or choose one below.", featuredCities: "Popular cities", dataNote: "Weather data from Open-Meteo. If the live service is unavailable, clearly labeled sample conditions keep the demo usable.", attribution: "Weather data by Open-Meteo", demoLabel: "Interactive web demo",
    fallbackNotice: "Live weather is unavailable. Showing simulated sample conditions.", retry: "Retry", loading: "Loading forecast…", searchLoading: "Searching…", searchNeedMore: "Enter at least 2 characters to search.", noResults: "No cities found. Try another name.", offlineSearch: "City search is offline. Showing matching cities from the local list.", offlineNoResults: "City search is offline and no local match was found.", citySaved: "City added to your saved places.", cityRemoved: "City removed from your saved places.", duplicateCity: "This city is already saved.", favoriteLimit: "You can save up to 8 cities.", selectedCity: "Showing weather for {city}.", refreshed: "Forecast refreshed.", failedRetry: "Could not refresh the forecast. Showing sample conditions.", day: "Day", unavailable: "—",
  },
  id: {
    navOverview: "Ringkasan", navHourly: "Per jam", navForecast: "7 hari", navDetails: "Detail",
    checkingData: "Memeriksa prakiraan", liveData: "Data Langsung", simulatedData: "Data Simulasi",
    dashboardEyebrow: "Cuaca, sekilas", searchLabel: "Cari kota", searchPlaceholder: "Cari kota atau wilayah…", searchSubmit: "Cari",
    settings: "Preferensi", close: "Tutup preferensi", temperatureUnit: "Satuan suhu", language: "Bahasa", appearance: "Tampilan",
    light: "Terang", dark: "Gelap", system: "Sistem", celsius: "Celsius", fahrenheit: "Fahrenheit",
    alerts: "Preferensi peringatan", severeAlert: "Cuaca ekstrem", rainAlert: "Prakiraan hujan", dailyAlert: "Prakiraan harian",
    alertsNote: "Preferensi disimpan di perangkat ini. Demo ini tidak mengirim notifikasi browser.",
    currentConditions: "Kondisi saat ini", feelsLike: "Terasa seperti", todayHigh: "Tertinggi hari ini", todayLow: "Terendah hari ini", saveCity: "Simpan kota", removeCity: "Hapus dari favorit", saved: "Tersimpan",
    hourlyTitle: "Prakiraan per jam", next24: "24 JAM KE DEPAN", temperatureTrend: "Tren suhu", basedOnForecast: "Berdasarkan prakiraan untuk lokasi ini", sevenDay: "Prakiraan 7 hari", dailyOutlook: "PRAKIRAAN HARIAN", details: "Detail cuaca", now: "Sekarang", today: "Hari ini",
    uvIndex: "Indeks UV", humidity: "Kelembapan", wind: "Angin", visibility: "Jarak pandang", precipitation: "Curah hujan (terbaru)", max: "Tertinggi", min: "Terendah", precipChance: "Peluang hujan", noValue: "Tidak tersedia",
    myPlaces: "Kota tersimpan", favoritesCount: "{count} / 8", addCurrent: "Simpan kota ini", emptyFavorites: "Belum ada kota tersimpan. Simpan kota ini atau pilih kota di bawah.", featuredCities: "Kota populer", dataNote: "Data cuaca dari Open-Meteo. Jika layanan langsung tidak tersedia, kondisi contoh ditampilkan dengan label simulasi.", attribution: "Data cuaca oleh Open-Meteo", demoLabel: "Demo web interaktif",
    fallbackNotice: "Data cuaca langsung tidak tersedia. Menampilkan kondisi contoh yang disimulasikan.", retry: "Coba lagi", loading: "Memuat prakiraan…", searchLoading: "Mencari…", searchNeedMore: "Masukkan minimal 2 karakter untuk mencari.", noResults: "Kota tidak ditemukan. Coba nama lain.", offlineSearch: "Pencarian kota offline. Menampilkan kota yang cocok dari daftar lokal.", offlineNoResults: "Pencarian kota offline dan tidak ada kecocokan di daftar lokal.", citySaved: "Kota ditambahkan ke daftar tersimpan.", cityRemoved: "Kota dihapus dari daftar tersimpan.", duplicateCity: "Kota ini sudah tersimpan.", favoriteLimit: "Maksimal 8 kota dapat disimpan.", selectedCity: "Menampilkan cuaca untuk {city}.", refreshed: "Prakiraan diperbarui.", failedRetry: "Prakiraan tidak dapat diperbarui. Menampilkan kondisi simulasi.", day: "Hari", unavailable: "—",
  },
};

const state = {
  city: readCity(),
  weather: null,
  source: "loading",
  favorites: readFavorites(),
  settings: readSettings(),
  searchTimer: null,
  searchController: null,
  toastTimer: null,
  requestNumber: 0,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const text = (key, values = {}) => {
  let value = (TEXT[state.settings.language] || TEXT.en)[key] || TEXT.en[key] || key;
  Object.entries(values).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
};

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { showToast("Storage is unavailable in this browser."); }
}

function validCity(value) {
  return value && typeof value.name === "string" && typeof value.country === "string" && Number.isFinite(value.latitude) && Number.isFinite(value.longitude);
}

function readCity() {
  const saved = readJson(STORAGE.city);
  return validCity(saved) ? saved : DEFAULT_CITY;
}

function readFavorites() {
  const saved = readJson(STORAGE.favorites);
  return Array.isArray(saved) ? saved.filter(validCity).slice(0, MAX_FAVORITES) : [];
}

function readSettings() {
  const saved = readJson(STORAGE.settings) || {};
  return {
    temperatureUnit: saved.temperatureUnit === "f" ? "f" : "c",
    language: saved.language === "id" ? "id" : "en",
    theme: ["light", "dark", "system"].includes(saved.theme) ? saved.theme : "light",
    alerts: {
      severe: Boolean(saved.alerts?.severe),
      rain: Boolean(saved.alerts?.rain),
      daily: Boolean(saved.alerts?.daily),
    },
  };
}

function persistCity() { writeJson(STORAGE.city, state.city); }
function persistFavorites() { writeJson(STORAGE.favorites, state.favorites); }
function persistSettings() { writeJson(STORAGE.settings, state.settings); }

function applyLanguage() {
  document.documentElement.lang = state.settings.language;
  $$('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach((element) => { element.placeholder = text(element.dataset.i18nPlaceholder); });
  $$('[data-i18n-aria]').forEach((element) => { element.setAttribute("aria-label", text(element.dataset.i18nAria)); });
  document.title = state.settings.language === "id" ? "Weatherly Demo | Dasbor Cuaca" : "Weatherly Demo | Weather Dashboard";
  renderSource();
  renderFavorites();
  renderPopularCities();
  if (state.weather) renderWeather();
  renderSearchMessage();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  $$('[data-setting="theme"]').forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === state.settings.theme));
  });
}

function updatePreferenceButtons() {
  $$('[data-setting="temperatureUnit"]').forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === state.settings.temperatureUnit));
  });
  $$('[data-setting="language"]').forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === state.settings.language));
  });
  $$('[data-alert]').forEach((input) => {
    input.checked = state.settings.alerts[input.dataset.alert];
  });
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function temperature(value) {
  if (!Number.isFinite(value)) return text("noValue");
  const converted = state.settings.temperatureUnit === "f" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°${state.settings.temperatureUnit.toUpperCase()}`;
}

function localHour(value) {
  return typeof value === "string" && value.length >= 16 ? value.slice(11, 16) : "—";
}

function formatDate(value, options = {}) {
  if (typeof value !== "string") return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(state.settings.language === "id" ? "id-ID" : "en-US", { timeZone: "UTC", ...options }).format(date);
}

function formatFetchedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(state.settings.language === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function weatherSvg(icon, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#weather-${icon}`);
  svg.append(use);
  return svg;
}

function describeDirection(degrees) {
  if (!Number.isFinite(degrees)) return text("noValue");
  const labels = state.settings.language === "id" ? ["U", "TL", "T", "TG", "S", "BD", "B", "BL"] : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(degrees / 45) % 8];
}

function windValue() {
  const speed = state.weather?.current.windSpeed;
  if (!Number.isFinite(speed)) return { value: text("noValue"), caption: "" };
  const direction = state.weather.current.windDirection;
  const rotated = Number.isFinite(direction) ? `<span class="wind-arrow" aria-hidden="true">↗</span> ${describeDirection(direction)}` : "";
  const speedValue = state.settings.language === "id" ? `${Math.round(speed)} km/j` : `${Math.round(speed)} km/h`;
  return { value: speedValue, caption: rotated };
}

function renderSource() {
  const badge = $("#source-badge");
  if (!badge) return;
  badge.dataset.source = state.source;
  const label = state.source === "live" ? text("liveData") : state.source === "fallback" ? text("simulatedData") : state.source === "error" ? (state.settings.language === "id" ? "Prakiraan tidak tersedia" : "Forecast unavailable") : text("checkingData");
  setText("source-label", label);
}

function renderWeather() {
  const bundle = state.weather;
  if (!bundle) return;
  const current = bundle.current;
  const today = bundle.daily[0];
  const descriptor = describeWeather(current.weatherCode, state.settings.language);

  setText("city-title", bundle.city.name);
  setText("city-subtitle", [bundle.city.region, bundle.city.country].filter(Boolean).join(" · "));
  setText("current-time", `${text("currentConditions")} · ${localHour(current.time)}`);
  setText("current-condition", descriptor.label);
  setText("current-temperature", temperature(current.temperature));
  setText("today-high", temperature(today?.maximum));
  setText("today-low", temperature(today?.minimum));
  setText("feels-like", temperature(current.feelsLike));
  setText("humidity-value", Number.isFinite(current.humidity) ? `${Math.round(current.humidity)}%` : text("noValue"));
  setText("humidity-detail", Number.isFinite(current.humidity) ? `${Math.round(current.humidity)}%` : text("noValue"));
  setText("wind-value", windValue().value);
  setText("wind-detail", windValue().value);
  setText("wind-caption", windValue().caption.replace("<span class=\"wind-arrow\" aria-hidden=\"true\">↗</span> ", ""));
  setText("visibility-value", Number.isFinite(current.visibility) ? `${(current.visibility / 1000).toFixed(1)} km` : text("noValue"));
  setText("uv-value", Number.isFinite(current.uvIndex) ? current.uvIndex.toFixed(1) : text("noValue"));
  setText("precip-value", Number.isFinite(current.precipitation) ? `${current.precipitation.toFixed(1)} mm` : text("noValue"));
  setText("updated-at", formatFetchedAt(bundle.fetchedAt));

  const iconUse = $("#current-icon use");
  if (iconUse) iconUse.setAttribute("href", `#weather-${descriptor.icon}`);
  const isSaved = state.favorites.some((city) => city.id === bundle.city.id || sameCoordinates(city, bundle.city));
  const saveButton = $("#save-current");
  if (saveButton) {
    saveButton.setAttribute("aria-pressed", String(isSaved));
    saveButton.setAttribute("aria-label", isSaved ? text("removeCity") : text("saveCity"));
    setText("save-current-label", isSaved ? text("saved") : text("saveCity"));
  }
  const hero = $("#current-weather");
  if (hero) hero.setAttribute("aria-busy", "false");

  renderHourly(bundle.hourly);
  renderChart(bundle.hourly);
  renderDaily(bundle.daily);
  renderDetails();
  renderFavorites();
}

function renderHourly(hours) {
  const list = $("#hourly-list");
  list.replaceChildren();
  hours.slice(0, 24).forEach((hour, index) => {
    const item = document.createElement("li");
    item.className = "hour-item";
    const time = document.createElement("time");
    time.textContent = index === 0 ? text("now") : localHour(hour.time);
    const descriptor = describeWeather(hour.weatherCode, state.settings.language);
    const icon = weatherSvg(descriptor.icon);
    icon.setAttribute("aria-label", descriptor.label);
    const temp = document.createElement("strong");
    temp.textContent = temperature(hour.temperature);
    const chance = document.createElement("small");
    chance.textContent = Number.isFinite(hour.precipitationProbability) ? `${Math.round(hour.precipitationProbability)}%` : "";
    chance.setAttribute("aria-label", `${text("precipChance")}: ${chance.textContent}`);
    item.append(time, icon, temp, chance);
    list.append(item);
  });
  setText("hourly-count", `${Math.min(hours.length, 24)} ${state.settings.language === "id" ? "jam" : "hours"}`);
}

function renderChart(hours) {
  const svg = $("#temperature-graph");
  const ticks = $("#chart-ticks");
  const values = hours.slice(0, 24).filter((hour) => Number.isFinite(hour.temperature));
  svg.replaceChildren();
  ticks.replaceChildren();
  if (!values.length) return;

  const width = 840;
  const height = 190;
  const padX = 12;
  const padY = 18;
  const min = Math.min(...values.map((point) => point.temperature));
  const max = Math.max(...values.map((point) => point.temperature));
  const range = Math.max(2, max - min);
  const coords = values.map((point, index) => ({
    x: padX + (values.length === 1 ? 0 : (index / (values.length - 1)) * (width - padX * 2)),
    y: padY + ((max - point.temperature) / range) * (height - padY * 2),
  }));
  const ns = "http://www.w3.org/2000/svg";
  const makeSvg = (name, attrs = {}) => {
    const element = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const defs = makeSvg("defs");
  const gradient = makeSvg("linearGradient", { id: "chart-fill", x1: "0", x2: "0", y1: "0", y2: "1" });
  gradient.append(makeSvg("stop", { offset: "0", "stop-color": "#39a89a", "stop-opacity": ".25" }), makeSvg("stop", { offset: "1", "stop-color": "#39a89a", "stop-opacity": "0" }));
  defs.append(gradient);
  svg.append(defs);
  [0.2, 0.5, 0.8].forEach((fraction) => svg.append(makeSvg("line", { x1: padX, x2: width - padX, y1: height * fraction, y2: height * fraction, class: "grid-line" })));
  const points = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`;
  svg.append(makeSvg("polygon", { points: area, class: "chart-area" }));
  svg.append(makeSvg("polyline", { points, class: "chart-line" }));
  coords.forEach((point) => svg.append(makeSvg("circle", { cx: point.x, cy: point.y, r: 3.5, class: "chart-point-halo" })));
  svg.setAttribute("aria-label", `${text("temperatureTrend")}: ${values.map((item) => `${localHour(item.time)} ${temperature(item.temperature)}`).join(", ")}`);

  const tickIndexes = [...new Set([0, Math.round((values.length - 1) / 3), Math.round(((values.length - 1) * 2) / 3), values.length - 1])];
  tickIndexes.forEach((index) => {
    const label = document.createElement("span");
    label.textContent = index === 0 ? text("now") : localHour(values[index].time);
    ticks.append(label);
  });
  setText("chart-range", `${temperature(min)} — ${temperature(max)}`);
}

function renderDaily(days) {
  const list = $("#daily-list");
  list.replaceChildren();
  days.slice(0, 7).forEach((day, index) => {
    const item = document.createElement("li");
    item.className = "daily-item";
    const date = document.createElement("span");
    date.className = "daily-date";
    date.textContent = index === 0 ? text("today") : formatDate(day.date, { weekday: "short", day: "numeric" });
    const descriptor = describeWeather(day.weatherCode, state.settings.language);
    const icon = weatherSvg(descriptor.icon);
    icon.setAttribute("aria-label", descriptor.label);
    const condition = document.createElement("span");
    condition.className = "daily-condition";
    condition.textContent = descriptor.short;
    const range = document.createElement("span");
    range.className = "daily-range";
    const low = document.createElement("span");
    low.textContent = temperature(day.minimum);
    const high = document.createElement("strong");
    high.textContent = temperature(day.maximum);
    range.append(low, high);
    item.append(date, icon, condition, range);
    if (Number.isFinite(day.precipitationProbability)) {
      const rain = document.createElement("small");
      rain.className = "daily-rain";
      rain.textContent = `${text("precipChance")} ${Math.round(day.precipitationProbability)}%`;
      item.append(rain);
    }
    list.append(item);
  });
}

function renderDetails() {
  const wind = windValue();
  setText("wind-value", wind.value);
  setText("wind-caption", wind.caption.replace("<span class=\"wind-arrow\" aria-hidden=\"true\">↗</span> ", ""));
  setText("uv-label", text("uvIndex"));
  setText("humidity-label", text("humidity"));
  setText("wind-label", text("wind"));
  setText("visibility-label", text("visibility"));
  setText("precip-label", text("precipitation"));
}

function sameCoordinates(left, right) {
  return Math.abs(left.latitude - right.latitude) < 0.001 && Math.abs(left.longitude - right.longitude) < 0.001;
}

function renderFavorites() {
  const list = $("#favorite-list");
  if (!list) return;
  list.replaceChildren();
  setText("favorite-count", text("favoritesCount", { count: state.favorites.length }));
  if (!state.favorites.length) {
    const empty = document.createElement("li");
    empty.className = "favorite-empty";
    empty.textContent = text("emptyFavorites");
    list.append(empty);
    return;
  }

  state.favorites.forEach((city) => {
    const row = document.createElement("li");
    row.className = "favorite-row";
    const select = document.createElement("button");
    select.type = "button";
    select.className = "favorite-select";
    select.dataset.selectCity = city.id;
    select.setAttribute("aria-current", String(city.id === state.city.id || sameCoordinates(city, state.city)));
    const symbol = document.createElement("span");
    symbol.className = "favorite-symbol";
    symbol.append(createUiIcon("location"));
    const copy = document.createElement("span");
    copy.className = "favorite-copy";
    const name = document.createElement("strong");
    name.textContent = city.name;
    const area = document.createElement("small");
    area.textContent = [city.region, city.country].filter(Boolean).join(" · ");
    copy.append(name, area);
    select.append(symbol, copy);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-favorite";
    remove.dataset.removeCity = city.id;
    remove.setAttribute("aria-label", `${text("removeCity")}: ${city.name}`);
    remove.append(createUiIcon("close"));
    row.append(select, remove);
    list.append(row);
  });
}

function createUiIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#ui-${name}`);
  svg.append(use);
  return svg;
}

function renderPopularCities() {
  const list = $("#popular-list");
  if (!list) return;
  list.replaceChildren();
  POPULAR_CITIES.slice(0, 6).forEach((city) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.selectPopular = city.id;
    button.textContent = city.name;
    item.append(button);
    list.append(item);
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

function setAnnouncement(visible, message = "") {
  const notice = $("#weather-note");
  notice.hidden = !visible;
  if (message) setText("weather-note-text", message);
}

function renderUnavailable() {
  const unavailable = text("noValue");
  const message = state.settings.language === "id"
    ? "Data cuaca dan data contoh tidak dapat dimuat. Coba lagi."
    : "Live weather and sample data could not be loaded. Please try again.";
  setAnnouncement(true, message);
  setText("current-time", state.settings.language === "id" ? "Prakiraan belum tersedia" : "Forecast unavailable");
  setText("current-condition", state.settings.language === "id" ? "Coba muat ulang data cuaca" : "Try loading the weather again");
  ["current-temperature", "today-high", "today-low", "feels-like", "humidity-value", "humidity-detail", "wind-value", "wind-detail", "wind-caption", "uv-value", "visibility-value", "precip-value", "updated-at", "chart-range", "hourly-count"].forEach((id) => setText(id, unavailable));
  $("#hourly-list").replaceChildren();
  $("#daily-list").replaceChildren();
  $("#temperature-graph").replaceChildren();
  $("#chart-ticks").replaceChildren();
  $("#current-weather").setAttribute("aria-busy", "false");
}

async function loadWeather({ fresh = false, announce = false } = {}) {
  const requestId = ++state.requestNumber;
  const hero = $("#current-weather");
  hero.setAttribute("aria-busy", "true");
  if (!state.weather) setText("current-condition", text("loading"));
  try {
    const bundle = await fetchCityWeather(state.city, { fresh });
    if (requestId !== state.requestNumber) return;
    state.weather = bundle;
    state.source = "live";
    setAnnouncement(false);
    renderSource();
    renderWeather();
    if (announce) showToast(text("refreshed"));
  } catch (error) {
    if (requestId !== state.requestNumber) return;
    try {
      state.weather = buildSampleWeather(state.city);
    } catch {
      state.weather = null;
      state.source = "error";
      renderSource();
      renderUnavailable();
      if (announce) showToast(state.settings.language === "id" ? "Data cuaca tidak tersedia. Coba lagi." : "Weather is unavailable. Please try again.");
      return;
    }
    state.source = "fallback";
    setAnnouncement(true, text("fallbackNotice"));
    renderSource();
    renderWeather();
    if (announce) showToast(text("failedRetry"));
  }
}

function addFavorite(city) {
  if (state.favorites.some((item) => item.id === city.id || sameCoordinates(item, city))) {
    showToast(text("duplicateCity"));
    return;
  }
  if (state.favorites.length >= MAX_FAVORITES) {
    showToast(text("favoriteLimit"));
    return;
  }
  state.favorites = [...state.favorites, city];
  persistFavorites();
  renderFavorites();
  renderWeather();
  showToast(text("citySaved"));
}

function removeFavorite(id) {
  state.favorites = state.favorites.filter((city) => city.id !== id);
  persistFavorites();
  renderFavorites();
  renderWeather();
  showToast(text("cityRemoved"));
}

function toggleCurrentFavorite() {
  const match = state.favorites.find((city) => city.id === state.city.id || sameCoordinates(city, state.city));
  if (match) removeFavorite(match.id);
  else addFavorite(state.city);
}

async function selectCity(city) {
  if (!validCity(city)) return;
  state.city = city;
  persistCity();
  $("#city-query").value = "";
  closeSearchResults();
  setText("city-title", city.name);
  setText("city-subtitle", [city.region, city.country].filter(Boolean).join(" · "));
  renderFavorites();
  await loadWeather();
}

function renderSearchMessage(message = "") {
  setText("search-message", message);
}

function renderSearchResults(cities, { offline = false, query = "" } = {}) {
  const list = $("#city-results");
  list.replaceChildren();
  if (!cities.length) {
    list.hidden = true;
    $("#city-query").setAttribute("aria-expanded", "false");
    renderSearchMessage(offline ? text("offlineNoResults") : text("noResults"));
    return;
  }
  cities.forEach((city, index) => {
    const item = document.createElement("li");
    item.setAttribute("role", "presentation");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.role = "option";
    button.setAttribute("aria-selected", "false");
    button.dataset.resultIndex = String(index);
    const icon = document.createElement("span");
    icon.className = "search-result-icon";
    icon.append(createUiIcon("location"));
    const copy = document.createElement("span");
    copy.className = "search-result-copy";
    const name = document.createElement("strong");
    name.textContent = city.name;
    const region = document.createElement("small");
    region.textContent = [city.region, city.country].filter(Boolean).join(" · ");
    copy.append(name, region);
    button.append(icon, copy);
    item.append(button);
    list.append(item);
  });
  state.searchResults = cities;
  list.hidden = false;
  $("#city-query").setAttribute("aria-expanded", "true");
  renderSearchMessage(offline ? text("offlineSearch") : "");
}

async function runSearch() {
  const query = $("#city-query").value.trim();
  if (query.length < 2) {
    closeSearchResults();
    renderSearchMessage(text("searchNeedMore"));
    return;
  }
  state.searchController?.abort();
  const controller = new AbortController();
  state.searchController = controller;
  renderSearchMessage(text("searchLoading"));
  try {
    const cities = await searchCities(query, state.settings.language, controller.signal);
    if (!controller.signal.aborted) renderSearchResults(cities, { query });
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") return;
    renderSearchResults(searchPopularCities(query), { offline: true, query });
  }
}

function closeSearchResults() {
  const list = $("#city-results");
  list.hidden = true;
  $("#city-query").setAttribute("aria-expanded", "false");
}

function scheduleSearch() {
  clearTimeout(state.searchTimer);
  state.searchController?.abort();
  const query = $("#city-query").value.trim();
  if (query.length < 2) {
    closeSearchResults();
    renderSearchMessage(query.length ? text("searchNeedMore") : "");
    return;
  }
  state.searchTimer = setTimeout(runSearch, 380);
}

function bindEvents() {
  $("#city-query").addEventListener("input", scheduleSearch);
  $("#city-search").addEventListener("submit", (event) => { event.preventDefault(); clearTimeout(state.searchTimer); runSearch(); });
  $("#city-query").addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearchResults();
    if (event.key === "ArrowDown" && !$("#city-results").hidden) $(".search-result")?.focus();
  });
  $("#city-results").addEventListener("click", (event) => {
    const button = event.target.closest("[data-result-index]");
    if (button) selectCity(state.searchResults[Number(button.dataset.resultIndex)]);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#city-search")) closeSearchResults();
    if (!event.target.closest("#preferences-panel, #settings-button") && !$("#preferences-panel").hidden) closePreferences();
  });
  $("#save-current").addEventListener("click", toggleCurrentFavorite);
  $("#save-current-sidebar").addEventListener("click", () => addFavorite(state.city));
  $("#refresh-button").addEventListener("click", () => loadWeather({ fresh: true, announce: true }));
  $("#retry-button").addEventListener("click", () => loadWeather({ fresh: true }));
  $("#popular-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-popular]");
    const city = POPULAR_CITIES.find((item) => item.id === button?.dataset.selectPopular);
    if (city) selectCity(city);
  });
  $("#favorite-list").addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-city]");
    if (remove) { removeFavorite(remove.dataset.removeCity); return; }
    const select = event.target.closest("[data-select-city]");
    const city = state.favorites.find((item) => item.id === select?.dataset.selectCity);
    if (city) selectCity(city);
  });
  $("#settings-button").addEventListener("click", togglePreferences);
  $("#close-settings").addEventListener("click", closePreferences);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearchResults();
      closePreferences();
    }
  });
  $("#preferences-panel").addEventListener("click", (event) => {
    const button = event.target.closest("[data-setting]");
    if (button) {
      const setting = button.dataset.setting;
      const value = button.dataset.value;
      if (setting === "temperatureUnit") state.settings.temperatureUnit = value;
      if (setting === "language") state.settings.language = value;
      if (setting === "theme") state.settings.theme = value;
      persistSettings();
      applyTheme();
      updatePreferenceButtons();
      applyLanguage();
      return;
    }
    const checkbox = event.target.closest("[data-alert]");
    if (checkbox) {
      state.settings.alerts[checkbox.dataset.alert] = checkbox.checked;
      persistSettings();
    }
  });
}

function togglePreferences() {
  const panel = $("#preferences-panel");
  const open = panel.hidden;
  panel.hidden = !open;
  $("#settings-button").setAttribute("aria-expanded", String(open));
  if (open) $("#close-settings").focus();
}

function closePreferences() {
  const panel = $("#preferences-panel");
  if (panel.hidden) return;
  panel.hidden = true;
  $("#settings-button").setAttribute("aria-expanded", "false");
}

function init() {
  applyTheme();
  updatePreferenceButtons();
  applyLanguage();
  renderPopularCities();
  bindEvents();
  loadWeather();
}

init();
