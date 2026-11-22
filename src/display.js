import { getWeather, filterData } from "./weather.js";
import {
  renderWeatherCard,
  renderLoading,
  renderError,
} from "./render-weather-card.js";

const input = document.querySelector("input");
const searchBtn = document.querySelector("button");
let activeRequest = 0;

async function getIpCity() {
  const response = await fetch("https://ipwho.is/");
  if (!response.ok) {
    throw new Error(`IP geolocation failed with status ${response.status}.`);
  }

  const data = await response.json();
  if (!data.success || !data.city) {
    throw new Error("IP geolocation response did not include a city.");
  }

  return data.city;
}

async function showWeather(
  location,
  requestId = ++activeRequest,
  locationName,
) {
  renderLoading();

  try {
    const rawData = await getWeather(location);
    if (requestId !== activeRequest) return;

    renderWeatherCard(filterData(rawData, locationName));
  } catch (error) {
    if (requestId !== activeRequest) return;

    renderError(error.message || "Weather data could not be loaded.");
  }
}

async function loadInitialWeather() {
  const requestId = ++activeRequest;
  renderLoading();

  let location;
  let locationName;
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        });
      });

      if (requestId !== activeRequest) return;
      const { latitude, longitude } = position.coords;
      location = `${latitude},${longitude}`;

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        );
        if (!response.ok) {
          throw new Error(`Reverse geocoding failed with status ${response.status}.`);
        }

        const data = await response.json();
        locationName = data.city || data.locality;
        if (!locationName) {
          throw new Error("Reverse geocoding response did not include a city.");
        }
      } catch (error) {
        console.warn("Could not resolve the current city; trying IP location.", error);
        try {
          locationName = await getIpCity();
        } catch (ipError) {
          console.warn("Could not resolve a city name for the current location.", ipError);
          locationName = "Current location";
        }
      }
    } catch (error) {
      console.warn("Could not access device location; trying IP location.", error);
    }
  }

  if (requestId !== activeRequest) return;

  if (!location) {
    try {
      location = await getIpCity();
    } catch (error) {
      console.warn("Could not detect IP location; using Dubai.", error);
      location = "Dubai";
    }
  }

  if (requestId === activeRequest) {
    await showWeather(location, requestId, locationName);
  }
}

searchBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const location = input.value.trim();
  if (!location) return;

  input.value = "";
  showWeather(location);
});

loadInitialWeather();
