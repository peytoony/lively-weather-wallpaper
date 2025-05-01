// Replace with your weather API key
const API_KEY = "c2340585dd31d1167bb5b3f81e4fb5e2";
const CITY = "Madawaska"; // Replace with your city

/**
 * Fetches weather data for a specific city
 */
async function getWeatherData() {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
        weather: data.weather[0].main.toLowerCase(), // Gets weather condition (e.g., "rain", "clouds", "snow")
    };
}

/**
 * Calculates the closest half-hour interval to the current time
 */
function getClosestHalfHourTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Calculate closest half-hour interval
    const roundedMinutes = minutes < 15 ? "00" : minutes < 45 ? "30" : "00";
    const roundedHours = roundedMinutes === "00" && minutes >= 45 ? hours + 1 : hours;

    return {
        hours: roundedHours % 24, // Ensure it's in 24-hour format
        minutes: roundedMinutes,
    };
}

/**
 * Determines the time period (morning, afternoon, evening, night)
 */
function getTimePeriod(hours) {
    if (hours >= 7 && hours < 12) return "morning"; // 7 AM to 12 PM
    if (hours >= 12 && hours < 18) return "afternoon"; // 12 PM to 6 PM
    if (hours >= 18 && hours < 22) return "evening"; // 6 PM to 10 PM
    return "night"; // 10 PM to 7 AM
}

/**
 * Sets the background image based on weather, time period, and half-hour intervals
 */
function setBackground(weather, timePeriod, hours, minutes) {
    const background = document.getElementById("background");
    let imageUrl = "";

    if (timePeriod === "night") {
        imageUrl = "images/night.jpg";
    } else {
        // Dynamically set image based on time of day, weather, and half-hour
        imageUrl = `images/${timePeriod}-${hours}-${minutes}-${weather}.jpg`;
    }

    background.style.backgroundImage = `url(${imageUrl})`;
}

/**
 * Main function to update the wallpaper
 */
async function updateWallpaper() {
    const { weather } = await getWeatherData();
    const { hours, minutes } = getClosestHalfHourTime();
    const timePeriod = getTimePeriod(hours);

    document.getElementById("info").textContent = `Weather: ${weather}, Time: ${hours}:${minutes}`;
    setBackground(weather, timePeriod, hours, minutes);
}

// Update wallpaper every 30 minutes
updateWallpaper();
setInterval(updateWallpaper, 30 * 60 * 1000);