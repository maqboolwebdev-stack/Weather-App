import { getWeather, filterData } from './weather.js';
import { renderWeatherCard } from './render-weather-card.js';


const input = document.querySelector("input");
const searchBtn = document.querySelector("button");


searchBtn.addEventListener("click", function (e) {
  e.preventDefault();

  getWeather(input.value).then((rawData) => {
    const cleanWeather = filterData(rawData);

    renderWeatherCard(cleanWeather);
  });

  input.value = '';
});
