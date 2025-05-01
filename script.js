/**
 * Returns default weather data for testing
 */
async function getWeatherData() {
    // Return default weather condition and temperature
    return {
        weatherId: 500, // Default to light rain (Rain group)
        weatherMain: "rain", // Default weather group
        temperature: 15, // Default temperature in Celsius
    };
}

/**
 * Returns default closest half-hour time for testing
 */
function getClosestHalfHourTime() {
    // Return a fixed testing time (e.g., 1:30 PM)
    return { hours: 13, minutes: "30" };
}

/**
 * Returns a fixed time period for testing
 */
function getTimePeriod(hours) {
    // Return a fixed time period (e.g., "afternoon")
    return "afternoon";
}

/**
 * Maps weather condition ID to a specific image
 */
function mapWeatherToImage(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm.jpg"; // Thunderstorm
    if (weatherId >= 300 && weatherId < 400) return "drizzle.jpg"; // Drizzle
    if (weatherId >= 500 && weatherId < 600) return "rain.jpg"; // Rain
    if (weatherId >= 600 && weatherId < 700) return "snow.jpg"; // Snow
    if (weatherId >= 700 && weatherId < 800) return "atmosphere.jpg"; // Atmosphere (e.g., mist, fog)
    if (weatherId === 800) return "clear.jpg"; // Clear sky
    if (weatherId >= 801 && weatherId <= 804) {
        // Clouds
        if (weatherId === 801) return "few-clouds.jpg";
        if (weatherId === 802) return "scattered-clouds.jpg";
        if (weatherId === 803) return "broken-clouds.jpg";
        if (weatherId === 804) return "overcast-clouds.jpg";
    }
    return "default.jpg"; // Fallback image
}

/**
 * Sets the background image based on weather, time period, and half-hour interval
 */
function setBackground(weatherImage, timePeriod, hours, minutes) {
    const background = document.getElementById("background");
    let imageUrl = "";

    if (timePeriod === "night") {
        imageUrl = `images/night.jpg`; // Use a static night image
    } else {
        // Dynamically set image based on time period, half-hour interval, and weather
        imageUrl = `images/${timePeriod}-${hours}-${minutes}-${weatherImage}`;
    }

    background.style.backgroundImage = `url(${imageUrl})`;
}

/**
 * Main function to update the wallpaper
 */
async function updateWallpaper() {
    const { weatherId, temperature } = await getWeatherData();
    const { hours, minutes } = getClosestHalfHourTime();
    const timePeriod = getTimePeriod(hours);
    const weatherImage = mapWeatherToImage(weatherId);

    document.getElementById("info").textContent = `Weather: ${weatherId}, Temp: ${temperature}°C, Time: ${hours}:${minutes}`;
    setBackground(weatherImage, timePeriod, hours, minutes);
}

// Update wallpaper every 30 minutes
updateWallpaper();
setInterval(updateWallpaper, 30 * 60 * 1000);