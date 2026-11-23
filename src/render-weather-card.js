import clearIcon from "./assets/icons/weather-sun.svg";
import cloudyIcon from "./assets/icons/weather-cloud.svg";
import partlyCloudyIcon from "./assets/icons/weather-partly-cloudy.svg";
import rainIcon from "./assets/icons/weather-rain.svg";
import thunderstormIcon from "./assets/icons/weather-thunderstorm.svg";
import snowIcon from "./assets/icons/weather-snow.svg";
import fogIcon from "./assets/icons/weather-fog.svg";

const forecastIcons = {
  clear: clearIcon,
  cloudy: cloudyIcon,
  partlyCloudy: partlyCloudyIcon,
  rain: rainIcon,
  thunderstorm: thunderstormIcon,
  snow: snowIcon,
  fog: fogIcon,
};

export function renderLoading() {
  const mainContainer = document.querySelector("main");
  mainContainer.innerHTML = "";

  const loading = document.createElement("div");
  loading.className = "loading";

  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  const loadingText = document.createElement("p");
  loadingText.className = "loading-text";
  loadingText.textContent = "Loading weather...";

  loading.appendChild(spinner);
  loading.appendChild(loadingText);
  mainContainer.appendChild(loading);
}

export function renderError(message) {
  const mainContainer = document.querySelector("main");
  mainContainer.innerHTML = "";

  const errorContainer = document.createElement("div");
  errorContainer.className = "weather-error";
  errorContainer.textContent = message;
  mainContainer.appendChild(errorContainer);
}

function getForecastIcon(iconName, conditions) {
  const iconType = `${iconName || ""} ${conditions || ""}`.toLowerCase();

  if (/thunder|storm/.test(iconType)) {
    return forecastIcons.thunderstorm;
  }

  if (/snow|hail|sleet|ice/.test(iconType)) return forecastIcons.snow;
  if (/rain|shower|drizzle/.test(iconType)) return forecastIcons.rain;
  if (/fog|mist/.test(iconType)) return forecastIcons.fog;
  if (/partly/.test(iconType)) return forecastIcons.partlyCloudy;
  if (/overcast|cloud/.test(iconType)) return forecastIcons.cloudy;
  return forecastIcons.clear;
}

function createForecastIcon(iconName, conditions) {
  const icon = document.createElement("img");
  icon.className = "forecast-icon";
  icon.src = getForecastIcon(iconName, conditions);
  icon.alt = conditions || "Weather";
  return icon;
}

export function renderWeatherCard(data, forecast = []) {
  const mainContainer = document.querySelector("main");

  mainContainer.innerHTML = "";

  const weatherCard = document.createElement("div");
  weatherCard.className = "weather-card";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";

  const locationH1 = document.createElement("h1");
  locationH1.className = "location";
  locationH1.textContent = data.resolveAddress;

  const dateTimeP = document.createElement("p");
  dateTimeP.className = "date-time";
  const date = new Date(`${data.dateTime}T00:00:00`);
  const dateText = Number.isNaN(date.getTime())
    ? data.dateTime
    : date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
  let localTimeText = "";
  if (data.timezone) {
    try {
      localTimeText = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: data.timezone,
      }).format(new Date());
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }
  dateTimeP.textContent = localTimeText
    ? `${dateText} | ${localTimeText}`
    : dateText;

  const feelsLikeP = document.createElement("p");
  feelsLikeP.className = "feels-like";

  cardHeader.appendChild(locationH1);
  cardHeader.appendChild(dateTimeP);
  cardHeader.appendChild(feelsLikeP);

  const cardMain = document.createElement("div");
  cardMain.className = "card-main";

  const tempH2 = document.createElement("h2");
  tempH2.className = "temperature";

  const temperatureDisplay = document.createElement("div");
  temperatureDisplay.className = "temperature-display";

  const unitToggle = document.createElement("div");
  unitToggle.className = "temperature-unit-toggle";
  unitToggle.setAttribute("aria-label", "Temperature unit");

  const celsiusButton = document.createElement("button");
  celsiusButton.className = "temperature-unit";
  celsiusButton.type = "button";
  celsiusButton.textContent = "°C";
  celsiusButton.setAttribute("aria-pressed", "true");

  const wallSpan = document.createElement("span");
  wallSpan.textContent = "|";
  wallSpan.className = 'wallSpan';


  const fahrenheitButton = document.createElement("button");
  fahrenheitButton.className = "temperature-unit";
  fahrenheitButton.type = "button";
  fahrenheitButton.textContent = "°F";
  fahrenheitButton.setAttribute("aria-pressed", "false");

  unitToggle.appendChild(celsiusButton);
  unitToggle.appendChild(wallSpan);
  unitToggle.appendChild(fahrenheitButton);
  temperatureDisplay.appendChild(tempH2);
  temperatureDisplay.appendChild(unitToggle);

  let updateForecastTemperatures = () => {};

  function setTemperatureUnit(unit) {
    const convert = (celsius) =>
      unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
    const format = (celsius) => `${convert(celsius).toFixed(1)}°${unit}`;

    tempH2.textContent = convert(data.temperature).toFixed(1);
    feelsLikeP.textContent = `Feels like ${format(data.feelsLike)}`;

    const isFahrenheit = unit === "F";
    fahrenheitButton.setAttribute("aria-pressed", String(isFahrenheit));
    celsiusButton.setAttribute("aria-pressed", String(!isFahrenheit));
    updateForecastTemperatures(unit);
  }

  celsiusButton.addEventListener("click", () => setTemperatureUnit("C"));
  fahrenheitButton.addEventListener("click", () => setTemperatureUnit("F"));
  setTemperatureUnit("C");

  const conditionP = document.createElement("p");
  conditionP.className = "condition";
  conditionP.textContent = data.conditions;

  const descP = document.createElement("p");
  descP.className = "description";
  descP.textContent = data.description;

  cardMain.appendChild(temperatureDisplay);
  cardMain.appendChild(conditionP);
  cardMain.appendChild(descP);

  const cardDetails = document.createElement("div");
  cardDetails.className = "card-details";

  function createDetailItem(label, value) {
    const detailItem = document.createElement("div");
    detailItem.className = "detail-item";

    const detailLabel = document.createElement("span");
    detailLabel.className = "detail-label";
    detailLabel.textContent = label;

    const detailValue = document.createElement("span");
    detailValue.className = "detail-value";
    detailValue.textContent = value;

    detailItem.appendChild(detailLabel);
    detailItem.appendChild(detailValue);
    return detailItem;
  }

  cardDetails.appendChild(createDetailItem("Humidity", `${data.humidity}%`));
  cardDetails.appendChild(
    createDetailItem("Precipitation", `${data.perception}%`),
  );
  cardDetails.appendChild(
    createDetailItem("Wind Speed", `${data.windSpeed} km/h`),
  );

  const cardTop = document.createElement("div");
  cardTop.className = "weather-card__top";

  const currentWeather = document.createElement("div");
  currentWeather.className = "weather-card__current";
  currentWeather.appendChild(cardHeader);
  currentWeather.appendChild(cardMain);
  currentWeather.appendChild(cardDetails);

  const conditionGifContainer = document.createElement("div");
  conditionGifContainer.className = "weather-card__condition-gif";

  cardTop.appendChild(currentWeather);
  cardTop.appendChild(conditionGifContainer);
  weatherCard.appendChild(cardTop);

  if (forecast.length) {
    const forecastSection = document.createElement("section");
    forecastSection.className = "forecast-section";

    const forecastHeading = document.createElement("h2");
    forecastHeading.className = "forecast-heading";
    forecastHeading.textContent = "5-Day Forecast";

    const forecastCards = document.createElement("div");
    forecastCards.className = "forecast-cards";
    const forecastTemperatures = [];

    forecast.forEach((day, index) => {
      const forecastCard = document.createElement("article");
      forecastCard.className = "forecast-card";

      const dayName = document.createElement("h3");
      dayName.className = "forecast-day";
      const forecastDate = new Date(`${day.dateTime}T00:00:00`);
      dayName.textContent = Number.isNaN(forecastDate.getTime())
        ? `Day ${index + 1}`
        : forecastDate.toLocaleDateString("en-US", { weekday: "short" });

      const forecastIcon = createForecastIcon(day.icon, day.conditions);

      const temperatures = document.createElement("p");
      temperatures.className = "forecast-temperatures";
      forecastTemperatures.push({
        element: temperatures,
        high: day.high,
        low: day.low,
      });

      forecastCard.appendChild(dayName);
      forecastCard.appendChild(forecastIcon);
      forecastCard.appendChild(temperatures);
      forecastCards.appendChild(forecastCard);
    });

    updateForecastTemperatures = (unit) => {
      const convert = (celsius) =>
        unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
      forecastTemperatures.forEach(({ element, high, low }) => {
        element.textContent = `${convert(high).toFixed(0)}° / ${convert(low).toFixed(0)}°`;
      });
    };
    updateForecastTemperatures("C");

    forecastSection.appendChild(forecastHeading);
    forecastSection.appendChild(forecastCards);
    weatherCard.appendChild(forecastSection);
  }

  mainContainer.appendChild(weatherCard);
}
