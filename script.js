const API_KEY = "c2340585dd31d1167bb5b3f81e4fb5e2"; // Use provided API key
const LAT = 47.356140; // Your latitude
const LON = -68.328621; // Your longitude

let currentVideo = null; // Track the current video to avoid unnecessary changes

/**
 * Fetches weather data from OpenWeather API using latitude and longitude
 */
async function getWeatherData() {
    const overrideWeather = document.getElementById("override-weather").value.trim().toLowerCase();
    const overrideTemperature = document.getElementById("override-temperature").value.trim();
    const overrideEnabled = document.getElementById("override-weather-checkbox").checked;

    if (overrideEnabled && overrideWeather) {
        return {
            weatherId: overrideWeather === "rain" ? 500 : overrideWeather === "snow" ? 600 : overrideWeather === "thunderstorm" ? 200 : 800,
            weatherMain: overrideWeather,
            temperatureCelsius: parseFloat(overrideTemperature) || 20, // Default to 20°C if not provided
            temperatureFahrenheit: ((parseFloat(overrideTemperature) || 20) * 9 / 5 + 32).toFixed(1), // Convert to Fahrenheit
        };
    }

    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
        weatherId: data.weather[0].id, // Weather condition ID
        weatherMain: data.weather[0].main.toLowerCase(), // Weather group (e.g., Rain, Snow)
        temperatureCelsius: data.main.temp, // Temperature in Celsius
        temperatureFahrenheit: (data.main.temp * 9 / 5 + 32).toFixed(1), // Convert to Fahrenheit
    };
}

/**
 * Calculates the closest half-hour time interval
 */
function getClosestHalfHourTime() {
    const overrideTime = document.getElementById("override-time").value.trim();
    const overrideEnabled = document.getElementById("override-time-checkbox").checked;

    const now = overrideEnabled && overrideTime ? new Date(`1970-01-01T${overrideTime}:00`) : new Date();
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
 * Updates the video or photo based on weather conditions
 */
async function updateMedia(weatherCondition, timePeriod, hours, minutes) {
    const video = document.getElementById("weather-video");
    const background = document.getElementById("background");
    const mediaInfo = document.getElementById("media-info");
    const imageInfo = document.getElementById("image-info");

    if (weatherCondition === "rain" || weatherCondition === "thunderstorm") {
        // Use fallback logic for videos
        const fallbackVideoUrl = await findClosestVideo(weatherCondition, timePeriod, hours, minutes);

        // Display the attempted video URL
        mediaInfo.textContent = `Attempting Video: ${fallbackVideoUrl}`;
        imageInfo.textContent = `Video URL: ${fallbackVideoUrl}`;

        const videoExists = await fileExists(fallbackVideoUrl);

        if (videoExists) {
            video.src = fallbackVideoUrl;
            video.style.display = "block"; // Show the video
            background.style.backgroundImage = ""; // Clear static image
            currentVideo = fallbackVideoUrl;
            mediaInfo.textContent = `Displaying Video: ${fallbackVideoUrl} (File Found)`;
        } else {
            mediaInfo.textContent = `Video Not Found: ${fallbackVideoUrl}`;
        }
    } else {
        // Fallback to static image for other conditions
        video.style.display = "none"; // Hide video
        const fallbackImageUrl = await findClosestImage(weatherCondition, timePeriod, hours, minutes);

        // Display the attempted image URL
        imageInfo.textContent = `Attempting Image: ${fallbackImageUrl}`;
        background.style.backgroundImage = `url(${fallbackImageUrl})`;

        const imageExists = await fileExists(fallbackImageUrl);

        if (imageExists) {
            mediaInfo.textContent = `Displaying Image: ${fallbackImageUrl} (File Found)`;
        } else {
            mediaInfo.textContent = `Image Not Found: ${fallbackImageUrl}`;
        }
    }
}

/**
 * Finds the closest existing video by searching backward in time
 */
async function findClosestVideo(weatherCondition, timePeriod, hours, minutes) {
    let fallbackHours = hours;
    let fallbackMinutes = minutes;

    while (true) {
        const videoUrl = `videos/${timePeriod}-${fallbackHours}-${fallbackMinutes}-${weatherCondition}.mp4`;

        // Log the attempted video URL
        console.log(`Attempting video URL: ${videoUrl}`);
        document.getElementById("media-info").textContent = `Attempting Video: ${videoUrl}`;

        if (await fileExists(videoUrl)) {
            return videoUrl;
        }

        // Decrement the time
        if (fallbackMinutes === "30") {
            fallbackMinutes = "00";
        } else {
            fallbackMinutes = "30";
            fallbackHours = (fallbackHours - 1 + 24) % 24; // Wrap around for 24-hour format
        }

        // Break if we loop back to the original time
        if (fallbackHours === hours && fallbackMinutes === minutes) {
            console.warn("No fallback video found, using default.");
            const defaultVideo = `videos/default.mp4`;
            document.getElementById("media-info").textContent = `Attempting Video: ${defaultVideo}`;
            return defaultVideo; // Default video if no fallback found
        }
    }
}

/**
 * Finds the closest existing image by searching backward in time
 */
async function findClosestImage(weatherCondition, timePeriod, hours, minutes) {
    const overrideImagePath = document.getElementById("override-image-path").value.trim();
    const overrideEnabled = document.getElementById("override-image-checkbox").checked;

    if (overrideEnabled && overrideImagePath) {
        console.log(`Using overridden image path: ${overrideImagePath}`);
        return overrideImagePath;
    }

    let fallbackHours = hours;
    let fallbackMinutes = minutes;

    while (true) {
        const imageUrl = `images/${timePeriod}-${fallbackHours}-${fallbackMinutes}-${weatherCondition}.jpg`;

        // Log the attempted image URL
        console.log(`Attempting image URL: ${imageUrl}`);
        document.getElementById("image-info").textContent = `Attempting Image: ${imageUrl}`;

        if (await fileExists(imageUrl)) {
            return imageUrl;
        }

        // Decrement the time
        if (fallbackMinutes === "30") {
            fallbackMinutes = "00";
        } else {
            fallbackMinutes = "30";
            fallbackHours = (fallbackHours - 1 + 24) % 24; // Wrap around for 24-hour format
        }

        // Break if we loop back to the original time
        if (fallbackHours === hours && fallbackMinutes === minutes) {
            console.warn("No fallback image found, using default.");
            const defaultImage = "images/default.jpg";
            document.getElementById("image-info").textContent = `Attempting Image: ${defaultImage}`;
            return defaultImage; // Default image if no fallback found
        }
    }
}

/**
 * Checks if a file exists by making a HEAD request
 */
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        console.error("Error checking file existence:", error);
        return false;
    }
}

/**
 * Updates the time display
 */
function updateTimeDisplay() {
    const now = new Date();
    const timeDisplay = document.getElementById("time");
    timeDisplay.textContent = `Time: ${now.toLocaleTimeString()}`;
}

/**
 * Main function to update the wallpaper
 */
async function updateWallpaper() {
    const { hours, minutes } = getClosestHalfHourTime();

    // Update time display
    updateTimeDisplay();

    const { weatherId, temperatureFahrenheit, weatherMain } = await getWeatherData();
    const timePeriod = getTimePeriod(hours);
    const weatherCondition = mapWeatherCondition(weatherId);

    document.getElementById("weather").textContent = `Weather: ${weatherMain}`;
    document.getElementById("temperature").textContent = `Temperature: ${temperatureFahrenheit}°F`;

    updateMedia(weatherCondition, timePeriod, hours, minutes);
}

/**
 * Maps weather condition ID to a condition for media
 */
function mapWeatherCondition(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm"; // Thunderstorm
    if (weatherId >= 500 && weatherId < 600) return "rain"; // Rain
    if (weatherId >= 600 && weatherId < 700) return "snow"; // Snow
    if (weatherId === 800) return "clear"; // Clear sky
    if (weatherId >= 801 && weatherId <= 804) return "clouds"; // Clouds
    return "default"; // Other conditions
}

// Update wallpaper every 5 minutes
updateWallpaper();
setInterval(updateWallpaper, 5 * 60 * 1000); // Update weather every 5 minutes
setInterval(updateTimeDisplay, 1000); // Update time every second