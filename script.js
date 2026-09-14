// SHARED WEATHER OBJECT

const weatherData = {
    main: "",
    desc: "",
    temperature: 0,
    windSpeed: 0
};


// WEATHER API CONFIG

const WEATHER_API_KEY = "930b7bde3ee741093b8a36db28088d0c";

// HTML ELEMENTS
const weatherDiv = document.getElementById("weather");
const cityInput = document.getElementById("city");
const dateInput = document.getElementById("date");


// AUTO-FILL FORM FROM URL PARAMETERS

window.addEventListener("DOMContentLoaded", function () {
    const eventSelect = document.getElementById("event");

    // Populate the dropdown from EVENTS
    EVENTS.forEach(event => {
        const option = document.createElement("option");
        option.value = event.name;
        option.textContent = event.name;
        eventSelect.appendChild(option);
    });

    // Apply event details (city + date + weather fetch)
    function applyEventDetails() {
        const selected = findEventByName(eventSelect.value);
        if (!selected) {
            cityInput.value = "";
            dateInput.value = "";
            weatherDiv.innerHTML = `<p>Select an event to see the forecast.</p>`;
            return;
        }

        cityInput.value = selected.city;
        dateInput.value = selected.date;

        cityInput.dispatchEvent(new Event("change"));
        dateInput.dispatchEvent(new Event("change"));
    }

    // Read URL param (from homepage click)
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get("event");

    if (eventParam) {
        eventSelect.value = eventParam;
        applyEventDetails();
    }

    // Listen for user-driven changes
    eventSelect.addEventListener("change", applyEventDetails);
});


// GET WEATHER

async function getWeather() {
    const city = cityInput.value.trim();
    const selectedDate = dateInput.value;

    if (!city || !selectedDate) {
        weatherDiv.innerHTML = `<p>Select a city and date to see the forecast.</p>`;
        return;
    }

    weatherDiv.innerHTML = `<p>🌤️ Checking weather forecast...</p>`;

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast` +
                    `?q=${encodeURIComponent(city)}` +
                    `&appid=${WEATHER_API_KEY}` +
                    `&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found or weather API error.");
        }

        const data = await response.json();

        const matchingForecasts = data.list.filter(forecast => {
            const forecastDate = forecast.dt_txt.split(" ")[0];
            return forecastDate === selectedDate;
        });

        if (matchingForecasts.length === 0) {
            weatherDiv.innerHTML = `
                <div class="weather-result">
                    <h3>📅 Forecast Not Yet Available</h3>
                    <p>We can only predict weather up to <strong>5 days</strong> before an event.</p>
                    <small>Your event is further out. You can still register — we'll include a general advisory in your confirmation.</small>
                </div>`;

            weatherData.main = "Not Yet Available";
            weatherData.desc = "Forecast will be available within 5 days of the event";
            weatherData.temperature = 0;
            weatherData.windSpeed = 0;
            return;
        }

        let selectedForecast = matchingForecasts[0];

        for (const forecast of matchingForecasts) {
            const forecastTime = new Date(forecast.dt_txt.replace(" ", "T"));
            if (forecastTime.getHours() === 12) {
                selectedForecast = forecast;
                break;
            }
        }

        weatherData.main = selectedForecast.weather[0].main;
        weatherData.desc = selectedForecast.weather[0].description;
        weatherData.temperature = Math.round(selectedForecast.main.temp);
        weatherData.windSpeed = selectedForecast.wind.speed;

        // WEATHER ICON
        let icon = "🌤️";
        switch (weatherData.main) {
            case "Clear": icon = "☀️"; break;
            case "Clouds": icon = "☁️"; break;
            case "Rain": icon = "🌧️"; break;
            case "Drizzle": icon = "🌦️"; break;
            case "Thunderstorm": icon = "⛈️"; break;
            case "Snow": icon = "❄️"; break;
            case "Mist":
            case "Fog":
            case "Haze": icon = "🌫️"; break;
            default: icon = "🌤️";
        }

        // WEATHER ADVISORY
        let advisory = "";
        switch (weatherData.main) {
            case "Clear": advisory = "☀️ Good weather for outdoor events!"; break;
            case "Clouds": advisory = "☁️ Partly cloudy or cloudy conditions. Outdoor events should be okay."; break;
            case "Rain": advisory = "🌧️ Rain is expected. Consider preparing umbrellas or an indoor venue."; break;
            case "Drizzle": advisory = "🌦️ Light rain may occur. Consider bringing umbrellas."; break;
            case "Thunderstorm": advisory = "⛈️ Thunderstorms are possible. Consider postponing or moving the event indoors."; break;
            case "Snow": advisory = "❄️ Snow is expected. Plan accordingly."; break;
            case "Mist":
            case "Fog":
            case "Haze": advisory = "🌫️ Reduced visibility may occur. Take precautions."; break;
            default: advisory = "🌤️ Check the latest forecast before the event.";
        }

        weatherDiv.innerHTML = `
            <div class="weather-result">
                <h3>${icon} ${weatherData.main}</h3>
                <p><strong>${weatherData.desc}</strong></p>
                <p>🌡️ Temperature: ${weatherData.temperature}°C</p>
                <p>💨 Wind: ${weatherData.windSpeed} m/s</p>
                <p>📍 ${city}</p>
                <p>📅 ${selectedDate}</p>
                <hr>
                <p><strong>Weather Advisory</strong></p>
                <p>${advisory}</p>
            </div>`;

    } catch (error) {
        console.error("Weather error:", error);

        weatherDiv.innerHTML = `
            <div class="weather-result">
                <h3>❌ Weather Error</h3>
                <p>Unable to get weather information.</p>
                <small>${error.message}</small>
            </div>`;

        weatherData.main = "";
        weatherData.desc = "";
        weatherData.temperature = 0;
        weatherData.windSpeed = 0;
    }
}

cityInput.addEventListener("change", getWeather);
dateInput.addEventListener("change", getWeather);


// FORM SUBMISSION (via fetch with no-cors)

const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzP_z7mn_z_vgGz5h22FHYnjqf5LArOpiGJDGg37QJQiWCjkphpo4OQGcJrCchZToKd/exec";

document.getElementById("eventForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // MAKE SURE WEATHER EXISTS
    if (!weatherData.main) {
        alert("Please select an event with a valid forecast before submitting.");
        return;
    }

    // CREATE PAYLOAD
    const payload = {
        event: document.getElementById("event").value,
        city: document.getElementById("city").value,
        date: document.getElementById("date").value,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        guests: document.getElementById("guests").value,
        weatherMain: weatherData.main,
        weatherDesc: weatherData.desc,
        temperature: weatherData.temperature,
        windSpeed: weatherData.windSpeed
    };

    // DISABLE BUTTON
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';

    try {
        // SEND TO GOOGLE APPS SCRIPT
        // mode: "no-cors" bypasses the CORS preflight that Apps Script can't handle
        await fetch(APP_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "text/plain" }
        });

        // SHOW TOAST
        const toast = document.getElementById("toast");
        toast.textContent = "Registration submitted! Check your email.";
        toast.classList.add("show", "success");
        setTimeout(() => toast.classList.remove("show", "success"), 4000);

        // SHOW MODAL
        showModal(payload);

        // RESET FORM
        document.getElementById("eventForm").reset();
        weatherDiv.innerHTML = `<p>Select an event to see the forecast.</p>`;
        weatherData.main = "";
        weatherData.desc = "";
        weatherData.temperature = 0;
        weatherData.windSpeed = 0;

    } catch (error) {
        alert("Network error: " + error.message);
    } finally {
        // RE-ENABLE BUTTON
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    }
});



// MODAL
function showModal(payload) {
    const modal = document.querySelector(".modal-overlay");
    const confirmationMessage = document.getElementById("confirmationMessage");
    const weatherAdvisory = document.getElementById("weatherAdvisory");

    let icon = "🌤️";
    switch (payload.weatherMain) {
        case "Clear": icon = "☀️"; break;
        case "Clouds": icon = "☁️"; break;
        case "Rain": icon = "🌧️"; break;
        case "Drizzle": icon = "🌦️"; break;
        case "Thunderstorm": icon = "⛈️"; break;
        case "Snow": icon = "❄️"; break;
        case "Mist":
        case "Fog":
        case "Haze": icon = "🌫️"; break;
        case "Not Yet Available": icon = "📅"; break;
    }

    confirmationMessage.innerHTML = `
        <strong>${payload.event}</strong> has been registered!
        <br><br>
        📍 City: ${payload.city}
        <br>
        📅 Date: ${payload.date}
        <br>
        👤 Name: ${payload.name}
        <br>
        👥 Guests: ${payload.guests}
        <br><br>
        <small>Check your email in a few moments for your confirmation.</small>`;

    if (payload.weatherMain === "Not Yet Available") {
        weatherAdvisory.innerHTML = `
            <h3>${icon} ${payload.weatherMain}</h3>
            <p>${payload.weatherDesc}</p>`;
    } else {
        weatherAdvisory.innerHTML = `
            <h3>${icon} ${payload.weatherMain}</h3>
            <p>${payload.weatherDesc}</p>
            <p>🌡️ ${payload.temperature}°C</p>
            <p>💨 ${payload.windSpeed} m/s</p>`;
    }

    modal.classList.add("active");
}


// CLOSE MODAL
document.getElementById("modalCloseButton").addEventListener("click", function () {
    document.querySelector(".modal-overlay").classList.remove("active");
});