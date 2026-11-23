import { getWeather, filterData, filterForecast } from "./weather.js";
import {
  renderWeatherCard,
  renderLoading,
  renderError,
} from "./render-weather-card.js";
import { setAutomaticThemeFromSunTimes } from "./theme.js";
import { getConditionGif } from "./giphy.js";

const input = document.querySelector("input");
const searchBtn = document.querySelector("button");
let activeRequest = 0;

async function loadConditionGif(condition, requestId) {
  try {
    const gifUrl = await getConditionGif(condition);
    if (!gifUrl || requestId !== activeRequest) return;

    const container = document.querySelector(".weather-card__condition-gif");
    if (!container) return;

    const image = document.createElement("img");
    image.className = "weather-card__condition-gif-image";
    image.alt = `${condition} weather animation`;
    image.addEventListener(
      "load",
      () => {
        if (requestId === activeRequest && container.isConnected) {
          container.replaceChildren(image);
        }
      },
      { once: true },
    );
    image.addEventListener(
      "error",
      () => console.warn("Could not display the weather condition GIF."),
      { once: true },
    );
    image.src = gifUrl;
  } catch (error) {
    console.warn("Could not load a weather condition GIF.", error);
  }
}

function getUserFriendlyError(error, location) {
  const message = error instanceof Error ? error.message : "";

  if (/location not found/i.test(message)) {
    return `We couldn't find "${location}". Check the name and try again.`;
  }

  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "We couldn't connect to get the weather. Check your internet connection and try again.";
  }

  return "We couldn't load the weather. Please try again.";
}

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
  useLocationSunTimes = false,
) {
  renderLoading();

  try {
    const rawData = await getWeather(location);
    if (requestId !== activeRequest) return;

    if (useLocationSunTimes) {
      const currentConditions = rawData.currentConditions || {};
      const currentDay = rawData.days[0] || {};
      setAutomaticThemeFromSunTimes(
        currentConditions.sunriseEpoch ?? currentDay.sunriseEpoch,
        currentConditions.sunsetEpoch ?? currentDay.sunsetEpoch,
      );
    }

    const weatherData = filterData(rawData, locationName);
    renderWeatherCard(weatherData, filterForecast(rawData));
    void loadConditionGif(weatherData.conditions, requestId);
  } catch (error) {
    if (requestId !== activeRequest) return;

    renderError(getUserFriendlyError(error, locationName || location));
  }
}

async function loadInitialWeather() {
  const requestId = ++activeRequest;
  renderLoading();

  let location;
  let locationName;
  let useLocationSunTimes = false;
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
      useLocationSunTimes = true;

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
    await showWeather(location, requestId, locationName, useLocationSunTimes);
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
