import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherAlert,
  FarmingRecommendation,
  RainfallData,
  WeatherStats,
  FarmLocation,
} from "@/types/tree";

// Default farm location (Malaysia - adjust to your actual farm location)
const DEFAULT_LOCATION: FarmLocation = {
  name: "Durian Farm, Malaysia",
  latitude: 3.1390, // Kuala Lumpur area - adjust to actual farm location
  longitude: 101.6869,
  timezone: "Asia/Kuala_Lumpur",
  elevation: 50,
};

// Get farm location
export function getFarmLocation(): FarmLocation {
  if (typeof window === "undefined") return DEFAULT_LOCATION;

  const stored = localStorage.getItem("farm_location");
  if (!stored) {
    localStorage.setItem("farm_location", JSON.stringify(DEFAULT_LOCATION));
    return DEFAULT_LOCATION;
  }

  return JSON.parse(stored);
}

// Save farm location
export function saveFarmLocation(location: FarmLocation): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("farm_location", JSON.stringify(location));
}

// Get weather condition description
function getWeatherDescription(code: number): string {
  // WMO Weather interpretation codes
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherCodes[code] || "Unknown";
}

// Get weather icon
function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 3) return isDay ? "🌤️" : "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "⛈️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌤️";
}

// Fetch current weather from Open-Meteo API (free, no API key needed)
export async function getCurrentWeather(): Promise<CurrentWeather> {
  const location = getFarmLocation();

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index&timezone=${location.timezone}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      cloudCover: current.cloud_cover,
      visibility: 10, // Not available in free tier
      uvIndex: current.uv_index || 0,
      condition: getWeatherDescription(current.weather_code),
      conditionCode: current.weather_code,
      icon: getWeatherIcon(current.weather_code, current.is_day === 1),
      isDay: current.is_day === 1,
      precipitation: current.precipitation,
      timestamp: current.time,
    };
  } catch (error) {
    console.error("Error fetching current weather:", error);
    // Return mock data as fallback
    return getMockCurrentWeather();
  }
}

// Fetch 7-day forecast
export async function getWeeklyForecast(): Promise<DailyForecast[]> {
  const location = getFarmLocation();

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&timezone=${location.timezone}&forecast_days=7`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }

    const data = await response.json();
    const daily = data.daily;

    return daily.time.map((date: string, index: number) => ({
      date,
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
      avgTemp: Math.round(
        (daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2
      ),
      maxWindSpeed: Math.round(daily.wind_speed_10m_max[index]),
      totalPrecipitation: daily.precipitation_sum[index],
      avgHumidity: 70, // Not available in free tier
      chanceOfRain: daily.precipitation_probability_max[index] || 0,
      condition: getWeatherDescription(daily.weather_code[index]),
      conditionCode: daily.weather_code[index],
      icon: getWeatherIcon(daily.weather_code[index], true),
      sunrise: daily.sunrise[index],
      sunset: daily.sunset[index],
      uvIndex: daily.uv_index_max[index] || 0,
    }));
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return getMockWeeklyForecast();
  }
}

// Generate farming recommendations based on weather
export function generateFarmingRecommendations(
  forecast: DailyForecast[]
): FarmingRecommendation[] {
  const recommendations: FarmingRecommendation[] = [];

  // Analyze spraying conditions
  const sprayingDays: string[] = [];
  const avoidSprayingDays: string[] = [];

  forecast.forEach((day) => {
    // Ideal spraying: no rain, low wind, not too hot
    if (
      day.chanceOfRain < 30 &&
      day.maxWindSpeed < 15 &&
      day.maxTemp < 35 &&
      day.totalPrecipitation < 1
    ) {
      sprayingDays.push(day.date);
    }
    // Avoid spraying: rain, high wind
    if (day.chanceOfRain > 60 || day.maxWindSpeed > 20 || day.totalPrecipitation > 5) {
      avoidSprayingDays.push(day.date);
    }
  });

  recommendations.push({
    id: "rec-spraying",
    activity: "Spraying",
    recommendation:
      sprayingDays.length >= 3
        ? "Ideal"
        : sprayingDays.length > 0
        ? "Suitable"
        : "Not Recommended",
    reason:
      sprayingDays.length >= 3
        ? `${sprayingDays.length} ideal days this week with low wind and no rain`
        : sprayingDays.length > 0
        ? `${sprayingDays.length} suitable day(s) available`
        : "High wind or rain expected throughout the week",
    bestDays: sprayingDays,
    worstDays: avoidSprayingDays,
    tips: [
      "Spray early morning (6-9 AM) or late afternoon (4-6 PM)",
      "Avoid spraying when wind speed exceeds 15 km/h",
      "Check weather forecast before mixing pesticides",
      "Allow 4-6 hours drying time before rain",
    ],
    priority: avoidSprayingDays.length > 4 ? "High" : "Medium",
  });

  // Analyze fertilizing conditions
  const fertilizingDays: string[] = [];
  const avoidFertilizingDays: string[] = [];

  forecast.forEach((day) => {
    // Ideal fertilizing: light rain expected (helps absorption)
    if (
      day.chanceOfRain > 20 &&
      day.chanceOfRain < 70 &&
      day.totalPrecipitation > 5 &&
      day.totalPrecipitation < 30
    ) {
      fertilizingDays.push(day.date);
    }
    // Avoid: heavy rain (washes away) or drought
    if (day.totalPrecipitation > 50 || day.chanceOfRain < 10) {
      avoidFertilizingDays.push(day.date);
    }
  });

  recommendations.push({
    id: "rec-fertilizing",
    activity: "Fertilizing",
    recommendation:
      fertilizingDays.length >= 2
        ? "Ideal"
        : fertilizingDays.length > 0
        ? "Suitable"
        : "Not Recommended",
    reason:
      fertilizingDays.length >= 2
        ? `${fertilizingDays.length} ideal days with moderate rainfall for nutrient absorption`
        : fertilizingDays.length > 0
        ? `${fertilizingDays.length} suitable day available`
        : "Either too dry or heavy rain expected",
    bestDays: fertilizingDays,
    worstDays: avoidFertilizingDays,
    tips: [
      "Apply before light rain for better soil absorption",
      "Avoid heavy rain that can wash away fertilizer",
      "Water manually if no rain expected within 24 hours",
      "Check soil moisture before application",
    ],
    priority: "Medium",
  });

  // Analyze harvesting conditions
  const harvestingDays: string[] = [];
  forecast.forEach((day) => {
    // Ideal harvesting: dry weather
    if (day.chanceOfRain < 40 && day.totalPrecipitation < 5) {
      harvestingDays.push(day.date);
    }
  });

  recommendations.push({
    id: "rec-harvesting",
    activity: "Harvesting",
    recommendation: harvestingDays.length >= 4 ? "Ideal" : "Suitable",
    reason:
      harvestingDays.length >= 4
        ? `${harvestingDays.length} dry days ideal for harvesting`
        : "Some rain expected, plan accordingly",
    bestDays: harvestingDays,
    worstDays: [],
    tips: [
      "Harvest during dry weather to prevent mold",
      "Early morning harvest for best fruit quality",
      "Avoid harvesting immediately after rain",
      "Check durians for natural drop indicators",
    ],
    priority: "Low",
  });

  // Watering recommendations
  const wateringNeeded = forecast.filter((d) => d.totalPrecipitation < 5).length;

  recommendations.push({
    id: "rec-watering",
    activity: "Watering",
    recommendation: wateringNeeded >= 5 ? "Ideal" : wateringNeeded >= 3 ? "Suitable" : "Not Recommended",
    reason:
      wateringNeeded >= 5
        ? `Dry week expected - irrigation needed`
        : wateringNeeded >= 3
        ? `Moderate rainfall - supplement as needed`
        : "Adequate rainfall expected",
    bestDays: forecast.filter((d) => d.totalPrecipitation < 3).map((d) => d.date),
    worstDays: forecast.filter((d) => d.totalPrecipitation > 20).map((d) => d.date),
    tips: [
      "Water deeply but infrequently (2-3 times per week)",
      "Morning watering reduces fungal growth",
      "Monitor soil moisture 15-20cm deep",
      "Adjust based on tree age and fruit development",
    ],
    priority: wateringNeeded >= 5 ? "High" : "Low",
  });

  return recommendations;
}

// Generate weather alerts
export function generateWeatherAlerts(forecast: DailyForecast[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  forecast.forEach((day) => {
    // Heavy rain alert
    if (day.totalPrecipitation > 50) {
      alerts.push({
        id: `alert-rain-${day.date}`,
        severity: day.totalPrecipitation > 100 ? "Severe" : "Moderate",
        event: "Heavy Rain",
        headline: `Heavy rain expected on ${new Date(day.date).toLocaleDateString("en-MY", { weekday: "long", month: "short", day: "numeric" })}`,
        description: `Total rainfall: ${day.totalPrecipitation.toFixed(1)}mm. Avoid outdoor farm activities.`,
        startTime: day.date,
        endTime: day.date,
        affectedAreas: ["All zones"],
        recommendations: [
          "Postpone spraying and fertilizing",
          "Check drainage systems",
          "Secure loose equipment",
          "Monitor for soil erosion",
        ],
      });
    }

    // Strong wind alert
    if (day.maxWindSpeed > 30) {
      alerts.push({
        id: `alert-wind-${day.date}`,
        severity: day.maxWindSpeed > 50 ? "Severe" : "Moderate",
        event: "Strong Wind",
        headline: `Strong winds expected on ${new Date(day.date).toLocaleDateString("en-MY", { weekday: "long", month: "short", day: "numeric" })}`,
        description: `Wind speeds up to ${day.maxWindSpeed} km/h. Risk of branch damage.`,
        startTime: day.date,
        endTime: day.date,
        affectedAreas: ["All zones"],
        recommendations: [
          "Postpone tree pruning",
          "Avoid spraying pesticides",
          "Check tree support stakes",
          "Prepare for fallen branches",
        ],
      });
    }

    // Drought alert
    if (day.totalPrecipitation < 1 && day.chanceOfRain < 20) {
      const dryDays = forecast
        .slice(0, forecast.indexOf(day) + 1)
        .filter((d) => d.totalPrecipitation < 1).length;

      if (dryDays >= 5) {
        alerts.push({
          id: `alert-drought-${day.date}`,
          severity: dryDays >= 10 ? "Severe" : "Moderate",
          event: "Prolonged Dry Weather",
          headline: `${dryDays} consecutive dry days`,
          description: `No significant rainfall for ${dryDays} days. Irrigation required.`,
          startTime: day.date,
          endTime: day.date,
          affectedAreas: ["All zones"],
          recommendations: [
            "Increase watering frequency",
            "Mulch around trees to retain moisture",
            "Monitor young trees closely",
            "Consider drip irrigation",
          ],
        });
      }
    }

    // High UV alert
    if (day.uvIndex > 8) {
      alerts.push({
        id: `alert-uv-${day.date}`,
        severity: "Minor",
        event: "High UV Index",
        headline: `Very high UV levels on ${new Date(day.date).toLocaleDateString("en-MY", { weekday: "short" })}`,
        description: `UV Index: ${day.uvIndex}. Take sun protection measures.`,
        startTime: day.date,
        endTime: day.date,
        affectedAreas: ["All zones"],
        recommendations: [
          "Workers should use sun protection",
          "Schedule heavy work for early morning/late afternoon",
          "Provide shaded rest areas",
          "Ensure adequate hydration",
        ],
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

// Calculate weather statistics
export function calculateWeatherStats(forecast: DailyForecast[]): WeatherStats {
  const totalRainfall = forecast.reduce((sum, day) => sum + day.totalPrecipitation, 0);
  const rainyDays = forecast.filter((day) => day.totalPrecipitation > 5).length;
  const avgTemp = forecast.reduce((sum, day) => sum + day.avgTemp, 0) / forecast.length;
  const avgHumidity = forecast.reduce((sum, day) => sum + day.avgHumidity, 0) / forecast.length;
  const maxWind = Math.max(...forecast.map((day) => day.maxWindSpeed));

  const idealSprayingDays = forecast.filter(
    (day) =>
      day.chanceOfRain < 30 &&
      day.maxWindSpeed < 15 &&
      day.totalPrecipitation < 1
  ).length;

  const idealFertilizingDays = forecast.filter(
    (day) =>
      day.chanceOfRain > 20 &&
      day.chanceOfRain < 70 &&
      day.totalPrecipitation > 5 &&
      day.totalPrecipitation < 30
  ).length;

  return {
    avgTemperature: Math.round(avgTemp),
    totalRainfall: Math.round(totalRainfall * 10) / 10,
    rainyDays,
    avgHumidity: Math.round(avgHumidity),
    maxWindSpeed: maxWind,
    totalSunshine: (7 - rainyDays) * 8, // Rough estimate
    idealSprayingDays,
    idealFertilizingDays,
  };
}

// Mock data for fallback
function getMockCurrentWeather(): CurrentWeather {
  return {
    temperature: 28,
    feelsLike: 32,
    humidity: 75,
    pressure: 1013,
    windSpeed: 12,
    windDirection: 180,
    cloudCover: 40,
    visibility: 10,
    uvIndex: 6,
    condition: "Partly cloudy",
    conditionCode: 2,
    icon: "🌤️",
    isDay: true,
    precipitation: 0,
    timestamp: new Date().toISOString(),
  };
}

function getMockWeeklyForecast(): DailyForecast[] {
  const forecasts: DailyForecast[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    forecasts.push({
      date: date.toISOString().split("T")[0],
      maxTemp: 30 + Math.floor(Math.random() * 5),
      minTemp: 23 + Math.floor(Math.random() * 3),
      avgTemp: 27,
      maxWindSpeed: 10 + Math.floor(Math.random() * 10),
      totalPrecipitation: Math.random() * 20,
      avgHumidity: 70 + Math.floor(Math.random() * 15),
      chanceOfRain: Math.floor(Math.random() * 80),
      condition: i % 3 === 0 ? "Partly cloudy" : i % 2 === 0 ? "Light rain" : "Sunny",
      conditionCode: i % 3 === 0 ? 2 : i % 2 === 0 ? 61 : 0,
      icon: i % 3 === 0 ? "🌤️" : i % 2 === 0 ? "🌧️" : "☀️",
      sunrise: "06:30",
      sunset: "18:45",
      uvIndex: 5 + Math.floor(Math.random() * 4),
    });
  }

  return forecasts;
}
