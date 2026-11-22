import { getWeather, filterData } from "./weather.js";
import {
  renderWeatherCard,
  renderLoading,
  renderError,
} from "./render-weather-card.js";

const input = document.querySelector("input");
const searchBtn = document.querySelector("button");
let activeRequest = 0;

searchBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const location = input.value.trim();
  if (!location) return;

  const requestId = ++activeRequest;
  renderLoading();
  searchBtn.disabled = true;
  input.value = "";

  try {
    const rawData = await getWeather(location);
    if (requestId !== activeRequest) return;

    const cleanWeather = filterData(rawData);
    renderWeatherCard(cleanWeather);
  } catch (error) {
    if (requestId !== activeRequest) return;

    renderError(error.message || "Weather data could not be loaded.");
  } finally {
    if (requestId === activeRequest) {
      searchBtn.disabled = false;
    }
  }
});
