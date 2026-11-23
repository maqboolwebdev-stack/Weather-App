const GIPHY_API_KEY = "3pDrfCFw6TxmqbAwqlKszOgrEP1hGHdN";

function getSearchTerms(condition) {
  const normalizedCondition = condition.toLowerCase();

  if (/thunder|storm|lightning/.test(normalizedCondition)) {
    return ["thunderstorm", "lightning storm"];
  }
  if (/snow|sleet|hail|ice/.test(normalizedCondition)) {
    return ["snow", "snowing"];
  }
  if (/rain|drizzle|shower/.test(normalizedCondition)) {
    return ["rain", "rainy day"];
  }
  if (/fog|mist|haze/.test(normalizedCondition)) {
    return ["fog", "foggy weather"];
  }
  if (/partly/.test(normalizedCondition)) {
    return ["partly cloudy", "clouds"];
  }
  if (/cloud|overcast/.test(normalizedCondition)) {
    return ["cloudy", "clouds"];
  }
  if (/clear|sunny/.test(normalizedCondition)) {
    return ["sunshine", "sunny day", "sun"];
  }
  if (/wind/.test(normalizedCondition)) {
    return ["windy weather", "wind"];
  }

  return ["weather"];
}

export async function getConditionGif(condition) {
  for (const searchTerm of getSearchTerms(condition)) {
    const searchParams = new URLSearchParams({
      api_key: GIPHY_API_KEY,
      q: searchTerm,
      limit: "1",
      rating: "g",
    });
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?${searchParams}`,
    );
    if (!response.ok) {
      throw new Error(`GIPHY request failed with status ${response.status}.`);
    }

    const result = await response.json();
    const gif = result.data?.[0];
    const gifUrl =
      gif?.images?.fixed_height?.url ??
      gif?.images?.downsized_medium?.url ??
      gif?.images?.original?.url;
    if (typeof gifUrl === "string" && gifUrl.startsWith("https://")) {
      return gifUrl;
    }
  }

  return null;
}
