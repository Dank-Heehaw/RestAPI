// WeatherAPI.com credentials and endpoint
const API_KEY = "ef073344a0084a648e7232647260302";
const BASE_URL = "https://api.weatherapi.com/v1/current.json"; // Fetches real-time weather data

const form = document.getElementById("weather-form");
const input = document.getElementById("q");

// DOM elements for displaying status, results, and errors
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");

// DOM elements for individual weather data fields
const placeEl = document.getElementById("place");
const localtimeEl = document.getElementById("localtime");
const iconEl = document.getElementById("icon");
const conditionTextEl = document.getElementById("condition-text");
const tempEl = document.getElementById("temp");
const feelslikeEl = document.getElementById("feelslike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const updatedEl = document.getElementById("updated");

function setStatus(message) {
  statusEl.textContent = message || "";
}

function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function clearError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function showResult() {
  resultEl.hidden = false;
}

function hideResult() {
  resultEl.hidden = true;
}

function buildUrl(query) {
  const url = new URL(BASE_URL);
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("aqi", "no");
  return url.toString();
}

function toIconUrl(iconPath) {
  // WeatherAPI returns protocol-relative URLs (//cdn.weatherapi.com/...)
  // Convert to absolute HTTPS URL for reliable image loading
  if (!iconPath) return "";
  return iconPath.startsWith("//") ? `https:${iconPath}` : iconPath;
}

function formatPlace(location) {
  // Build location string from available parts (city, region, country)
  // Filter out undefined values to avoid leading/trailing commas
  const parts = [location?.name, location?.region, location?.country].filter(Boolean);
  return parts.join(", ");
}

function renderWeather(data) {
  const { location, current } = data;

  placeEl.textContent = formatPlace(location);
  localtimeEl.textContent = `Local time: ${location?.localtime ?? "—"}`;

  conditionTextEl.textContent = current?.condition?.text ?? "—";
  iconEl.src = toIconUrl(current?.condition?.icon);
  // Set empty alt since the weather condition is described in figcaption
  iconEl.alt = "";

  tempEl.textContent = typeof current?.temp_c === "number" ? current.temp_c.toFixed(1) : "—";
  feelslikeEl.textContent = typeof current?.feelslike_c === "number" ? current.feelslike_c.toFixed(1) : "—";
  humidityEl.textContent = typeof current?.humidity === "number" ? current.humidity : "—";

  const windKph = current?.wind_kph;
  const windDir = current?.wind_dir;
  windEl.textContent =
    typeof windKph === "number" ? `${windKph.toFixed(1)} kph ${windDir ?? ""}`.trim() : "—";

  pressureEl.textContent = typeof current?.pressure_mb === "number" ? current.pressure_mb.toFixed(0) : "—";
  visibilityEl.textContent = typeof current?.vis_km === "number" ? current.vis_km.toFixed(1) : "—";

  updatedEl.textContent = `Last updated: ${current?.last_updated ?? "—"}`;
}

async function fetchWeather(query) {
  const url = buildUrl(query);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  // Parse JSON response, but handle cases where API returns error in 200 response
  const data = await res.json().catch(() => null);

  // Check HTTP status first (non-200 responses)
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      `Request failed (${res.status}). Try another city name.`;
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Unknown API error.");
  }

  return data;
}

// Initialize the form with a default city suggestion
// Does not fetch weather automatically - user must submit to see results
async function loadDefault() {
  const defaultCity = "Toronto";
  input.value = defaultCity;
  hideResult();
  clearError();
  setStatus("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  clearError();
  hideResult();
  setStatus("Loading…");

  try {
    const data = await fetchWeather(query);
    renderWeather(data);
    showResult();
    setStatus("");
  } catch (err) {
    showError(err.message);
    setStatus("");
  }
});

// Initialize the app with default city suggestion
loadDefault();
