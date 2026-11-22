const API_KEY = "4R5QVRPAMCWF663U242A7KHSM";

async function getWeather(location) {
  try {
    const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?key=${API_KEY}&unitGroup=metric&contentType=json`;
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Location not found. Please check the city name.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Problem with fetching data:", error);
    throw error;
  }
}

function filterData(rawData, locationName) {
  const temperature = rawData.days[0].temp;
  const conditions = rawData.days[0].conditions;
  const description = rawData.days[0].description;
  const dateTime = rawData.days[0].datetime;
  const humidity = rawData.days[0].humidity;
  const perception = rawData.days[0].precip;
  const windSpeed = rawData.days[0].windspeed;
  const resolveAddress = locationName || rawData.resolvedAddress;
  const feelsLike = rawData.currentConditions.feelslike;

  return {
    temperature,
    conditions,
    description,
    dateTime,
    humidity,
    perception,
    windSpeed,
    resolveAddress,
    feelsLike
  };
}

function filterForecast(rawData) {
  return rawData.days.slice(1, 6).map((day) => ({
    dateTime: day.datetime,
    high: day.tempmax,
    low: day.tempmin,
    icon: day.icon,
    conditions: day.conditions,
  }));
}

export {getWeather, filterData, filterForecast};
