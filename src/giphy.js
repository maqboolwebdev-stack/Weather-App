const GIPHY_API_KEY = "3pDrfCFw6TxmqbAwqlKszOgrEP1hGHdN";
const GIF_CACHE_PREFIX = "weather-app-giphy-cache-v1:";
const GIF_CACHE_TTL = 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL = 15 * 60 * 1000;
const gifCache = new Map();
const inFlightRequests = new Map();

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

async function searchConditionGif(searchTerms) {
  for (const searchTerm of searchTerms) {
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

function readCachedGif(cacheKey) {
  const cached = gifCache.get(cacheKey);
  if (cached) {
    if (cached.expiresAt > Date.now()) return cached.url;
    gifCache.delete(cacheKey);
  }

  try {
    const stored = localStorage.getItem(`${GIF_CACHE_PREFIX}${cacheKey}`);
    if (!stored) return undefined;

    const entry = JSON.parse(stored);
    const validUrl =
      entry.url === null ||
      (typeof entry.url === "string" && entry.url.startsWith("https://"));
    if (
      !Number.isFinite(entry.expiresAt) ||
      entry.expiresAt <= Date.now() ||
      !validUrl
    ) {
      localStorage.removeItem(`${GIF_CACHE_PREFIX}${cacheKey}`);
      return undefined;
    }

    gifCache.set(cacheKey, entry);
    return entry.url;
  } catch (error) {
    console.warn("Could not read the cached weather GIF.", error);
    return undefined;
  }
}

function writeCachedGif(cacheKey, url) {
  const entry = {
    url,
    expiresAt: Date.now() + (url ? GIF_CACHE_TTL : EMPTY_CACHE_TTL),
  };
  gifCache.set(cacheKey, entry);

  try {
    localStorage.setItem(
      `${GIF_CACHE_PREFIX}${cacheKey}`,
      JSON.stringify(entry),
    );
  } catch (error) {
    console.warn("Could not save the weather GIF cache.", error);
  }
}

export function getConditionGif(condition) {
  const searchTerms = getSearchTerms(condition);
  const cacheKey = searchTerms.join("|");
  const cachedUrl = readCachedGif(cacheKey);
  if (cachedUrl !== undefined) return Promise.resolve(cachedUrl);

  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest) return existingRequest;

  const request = searchConditionGif(searchTerms)
    .then((url) => {
      writeCachedGif(cacheKey, url);
      return url;
    })
    .finally(() => inFlightRequests.delete(cacheKey));
  inFlightRequests.set(cacheKey, request);
  return request;
}
