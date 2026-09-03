const API_KEY = "4R5QVRPAMCWF663U242A7KHSM";

async function getWeather(location) {
  try {
    const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?key=${API_KEY}&unitGroup=metric&contentType=json`;
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Problem with fetching data:", error);
  }
}

function filterData(rawData) {
    const temperature = rawData.days[0].temp;
    const conditions = rawData.days[0].conditions;
    const description = rawData.days[0].description;
    const dateTime = rawData.days[0].datetime;
    const humidity = rawData.days[0].humidity;
    const perception = rawData.days[0].precip;
    const windSpeed = rawData.days[0].windspeed;
    const resolveAddress = rawData.resolvedAddress;


    return {temperature, conditions, description, dateTime, humidity, perception, windSpeed, resolveAddress};
}



const input = document.querySelector('input');
const searchBtn = document.querySelector('button');

searchBtn.addEventListener('click', function() {

    getWeather(input.value).then((rawData) => {

    const cleanWeather = filterData(rawData);

    console.log(cleanWeather.temperature);
    console.log(cleanWeather.conditions);
    console.log(cleanWeather.description);
    console.log(cleanWeather.dateTime);
    console.log(cleanWeather.humidity);
    console.log(cleanWeather.perception);
    console.log(cleanWeather.windSpeed);
    console.log(cleanWeather.resolveAddress);

});

})

