const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const LAT = 47.356140; // Your latitude
const LON = -68.328621; // Your longitude

/**
 * Fetches weather data from OpenWeather API using latitude and longitude
 */
async function getWeatherData() {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
        weatherId: data.weather[0].id, // Weather condition ID
        weatherMain: data.weather[0].main.toLowerCase(), // Weather group (e.g., Rain, Snow)
        temperature: data.main.temp, // Temperature in Celsius
    };
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
 * Calculates the closest half-hour time interval
 */
function getClosestHalfHourTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Round minutes to the closest half-hour interval
    const roundedMinutes = minutes < 15 ? "00" : minutes < 45 ? "30" : "00";
    const roundedHours = roundedMinutes === "00" && minutes >= 45 ? hours + 1 : hours;

    return {
        hours: roundedHours % 24, // Ensure hours wrap around at 24
        minutes: roundedMinutes,
    };
}

/**
 * Determines time period (morning, afternoon, evening, or night)
 */
function getTimePeriod(hours) {
    if (hours >= 7 && hours < 12) return "morning"; // 7 AM to 12 PM
    if (hours >= 12 && hours < 18) return "afternoon"; // 12 PM to 6 PM
    if (hours >= 18 && hours < 22) return "evening"; // 6 PM to 10 PM
    return "night"; // 10 PM to 7 AM
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