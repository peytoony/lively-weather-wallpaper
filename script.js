const API_KEY = "c2340585dd31d1167bb5b3f81e4fb5e2"; // Replace with your actual API key
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
 * Determines time period (morning, midday, evening, or night)
 */
function getTimePeriod(hours) {
    if (hours >= 7 && hours < 12) return "morning"; // 7 AM to 12 PM
    if (hours >= 12 && hours < 18) return "midday"; // 12 PM to 6 PM
    if (hours >= 18 && hours < 22) return "evening"; // 6 PM to 10 PM
    return "night"; // 10 PM to 7 AM
}

/**
 * Updates the video and audio based on weather conditions
 */
function updateMedia(weatherCondition, timePeriod) {
    const video = document.getElementById("weather-video");
    const audio = document.getElementById("weather-audio");

    // Map weather conditions to videos and audio
    const mediaMap = {
        rain: {
            video: `videos/rain-${timePeriod}.mp4`,
            audio: `audio/rain-loop.mp3`,
        },
        snow: {
            video: `videos/snow-${timePeriod}.mp4`,
            audio: `audio/snow-loop.mp3`,
        },
        thunderstorm: {
            video: `videos/thunder-${timePeriod}.mp4`,
            audio: `audio/thunder-loop.mp3`,
        },
    };

    if (mediaMap[weatherCondition]) {
        // Set video and audio sources
        video.src = mediaMap[weatherCondition].video;
        audio.src = mediaMap[weatherCondition].audio;
        
        // Ensure video and audio play
        video.style.display = "block";
        audio.style.display = "block";
        audio.play();
    } else {
        // Hide video and audio for other weather types
        video.style.display = "none";
        audio.style.display = "none";
    }
}

/**
 * Main function to update the wallpaper
 */
async function updateWallpaper() {
    const now = new Date();
    const currentHour = now.getHours();

    // Determine whether it's daytime or nighttime
    if (currentHour >= 22 || currentHour < 7) {
        // Night: Set static night image
        document.getElementById("info").textContent = `Nighttime: Static Image`;
        document.getElementById("background").style.backgroundImage = `url(images/night.jpg)`;
        updateMedia(null, null);
    } else {
        // Daytime: Fetch weather and update based on time + weather
        const { weatherId, temperature } = await getWeatherData();
        const timePeriod = getTimePeriod(currentHour);
        const weatherCondition = mapWeatherCondition(weatherId);

        document.getElementById("info").textContent = `Weather: ${weatherId}, Temp: ${temperature}°C`;
        updateMedia(weatherCondition, timePeriod);
    }
}

/**
 * Maps weather condition ID to a condition for videos and audio
 */
function mapWeatherCondition(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm"; // Thunderstorm
    if (weatherId >= 500 && weatherId < 600) return "rain"; // Rain
    if (weatherId >= 600 && weatherId < 700) return "snow"; // Snow
    return null; // Other conditions
}

// Update wallpaper every 30 minutes
updateWallpaper();
setInterval(updateWallpaper, 30 * 60 * 1000);