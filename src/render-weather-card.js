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

export function renderWeatherCard(data) {
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
  dateTimeP.textContent = Number.isNaN(date.getTime())
    ? data.dateTime
    : date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

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

  function setTemperatureUnit(unit) {
    const convert = (celsius) =>
      unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
    const format = (celsius) => `${convert(celsius).toFixed(1)}°${unit}`;

    tempH2.textContent = convert(data.temperature).toFixed(1);
    feelsLikeP.textContent = `Feels like ${format(data.feelsLike)}`;

    const isFahrenheit = unit === "F";
    fahrenheitButton.setAttribute("aria-pressed", String(isFahrenheit));
    celsiusButton.setAttribute("aria-pressed", String(!isFahrenheit));
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

  weatherCard.appendChild(cardHeader);
  weatherCard.appendChild(cardMain);
  weatherCard.appendChild(cardDetails);

  mainContainer.appendChild(weatherCard);
}
