//Weather variables

let weatherState = {
    temperature: null,
    feelsLike: null,
    min: null,
    max: null,
    wind: null,
    precipitation: null,
    daily: null,
    hourly: null,
    city: null,
    currentTime: null,
    currentCode: null,
    humidity: null,
    selectedDay: null
};

let units = {
    temperature: "celsius",
    wind: "kmh",
    precipitation: "mm"
};

// Show panel

const unitsBtn = document.querySelector('.nav-link');
const panel = document.querySelector('.panel');

unitsBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    panel.classList.toggle('open');
});

const daysBtn = document.querySelector('.days-toggler');
const daysPanel = document.querySelector('.days-panel');

daysBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    daysPanel.classList.toggle('open');
});

//Toggle options

const panels = document.querySelectorAll('.panel-options');

panels.forEach(panel =>{
    const buttons = panel.querySelectorAll('.option');

    buttons.forEach(button =>{
        button.addEventListener('click', () =>{
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});

//Switch imperial metric

const switch_im = document.querySelector('.option-switch');

switch_im.addEventListener('click', () => {

    const isMetric =
        units.temperature === "celsius" &&
        units.wind === "kmh" &&
        units.precipitation === "mm";

    if (isMetric) {
        units.temperature = "fahrenheit";
        units.wind = "mph";
        units.precipitation = "in";
        switch_im.textContent = "Switch to metric";
    } else {
        units.temperature = "celsius";
        units.wind = "kmh";
        units.precipitation = "mm";
        switch_im.textContent = "Switch to imperial";
    }

    updateActiveButtons();
    renderWeather();
    renderDaily();
    renderHourly();
});

function updateActiveButtons() {

    const optionGroups = document.querySelectorAll(".panel-options");

    const tempButtons = optionGroups[1].querySelectorAll(".option");
    const windButtons = optionGroups[2].querySelectorAll(".option");
    const rainButtons = optionGroups[3].querySelectorAll(".option");

    tempButtons.forEach(btn => {
        btn.classList.remove("active");
        if (
            (units.temperature === "celsius" && btn.textContent.includes("Celsius")) ||
            (units.temperature === "fahrenheit" && btn.textContent.includes("Fahrenheit"))
        ) {
            btn.classList.add("active");
        }
    });

    windButtons.forEach(btn => {
        btn.classList.remove("active");
        if (
            (units.wind === "kmh" && btn.textContent.includes("km")) ||
            (units.wind === "mph" && btn.textContent.includes("mph"))
        ) {
            btn.classList.add("active");
        }
    });

    rainButtons.forEach(btn => {
        btn.classList.remove("active");
        if (
            (units.precipitation === "mm" && btn.textContent.includes("Millimeters")) ||
            (units.precipitation === "in" && btn.textContent.includes("Inches"))
        ) {
            btn.classList.add("active");
        }
    });
}

// Temperature / Wind / Rain

const optionGroups = document.querySelectorAll(".panel-options");

const tempButtons = optionGroups[1].querySelectorAll(".option");
const windButtons = optionGroups[2].querySelectorAll(".option");
const rainButtons = optionGroups[3].querySelectorAll(".option");

tempButtons.forEach(button => {
    button.addEventListener("click", () => {
        units.temperature = button.textContent.includes("Celsius") ? "celsius" : "fahrenheit";
        renderWeather();
        renderDaily();
        renderHourly();
    });
});

windButtons.forEach(button => {
    button.addEventListener("click", () => {
        units.wind = button.textContent.includes("km") ? "kmh" : "mph";
        renderWeather();
    });
});

rainButtons.forEach(button => {
    button.addEventListener("click", () => {
        units.precipitation = button.textContent.includes("Millimeters") ? "mm" : "in";
        renderWeather();
    });
});

function getTempUnitSymbol() {
    return units.temperature === "celsius" ? "°C" : "°F";
}

//Get coordinates by search

const searchBtn = document.getElementById("search-button");
const cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    fetchCoordinates(city);
});

async function fetchCoordinates(city) {

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log("City not found");
            return;
        }

        const latitude = data.results[0].latitude;
        const longitude = data.results[0].longitude;

        const cityName = data.results[0].name;
        const country = data.results[0].country;

        weatherState.city = `${cityName}, ${country}`;

        fetchWeather(latitude,longitude);

    } catch (error) {
        console.error("Error fetching coordinates:", error);
    }
}

// Get weather

async function fetchWeather(lat,lon) {
    try{
        const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation,weathercode,apparent_temperature,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );

        const data = await response.json();

        weatherState.temperature = data.current_weather.temperature;
        weatherState.wind = data.current_weather.windspeed;
        weatherState.precipitation = data.hourly.precipitation[0];
        weatherState.daily = data.daily;
        weatherState.hourly = data.hourly;
        weatherState.currentTime = data.current_weather.time;
        weatherState.currentCode = data.current_weather.weathercode;
        weatherState.feelsLike = data.hourly.apparent_temperature[0];
        weatherState.humidity = data.hourly.relative_humidity_2m[0];
        weatherState.selectedDay = data.current_weather.time.split("T")[0];

        renderWeather();
        renderDaily();
        renderHourly();
        renderHero();

    }catch (error){
        console.error("Error fetching weather:", error);
    }
}

//Convertions and render

function renderWeather() {

    if (weatherState.temperature === null) return;

    let temp = weatherState.temperature;
    let wind = weatherState.wind;
    let rain = weatherState.precipitation;
    let feels = weatherState.feelsLike;

    if (units.temperature === "fahrenheit") {
        temp = (temp * 9/5) + 32;
        feels = (feels * 9/5) + 32;
    }

    if (units.wind === "mph") {
        wind = wind * 0.621371;
    }

    if (units.precipitation === "in") {
        rain = rain * 0.0393701;
    }

    document.querySelectorAll(".main-temp")
        .forEach(el => el.textContent = Math.round(temp) + getTempUnitSymbol());

    document.querySelector(".feels-like").textContent =
        Math.round(feels) + getTempUnitSymbol();

    document.getElementById("humidity").textContent =
        weatherState.humidity + "%";

    document.getElementById("wind").textContent =
        wind.toFixed(1) + (units.wind === "kmh" ? " km/h" : " mph");

    document.getElementById("precipitation").textContent =
        rain.toFixed(1) + (units.precipitation === "mm" ? " mm" : " in");
}

//Daily render

function renderDaily() {

    if (!weatherState.daily) return;

    const dailyContainer = document.getElementById("daily-container");
    if (!dailyContainer) return;

    dailyContainer.innerHTML = "";

    weatherState.daily.time.forEach((dateString, index) => {

        let min = weatherState.daily.temperature_2m_min[index];
        let max = weatherState.daily.temperature_2m_max[index];
        let code = weatherState.daily.weathercode[index];

        if (units.temperature === "fahrenheit") {
            min = (min * 9/5) + 32;
            max = (max * 9/5) + 32;
        }

        const date = new Date(dateString);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const icon = getWeatherIcon(code);

        const card = `
            <div class="daily-card">
                <p>${dayName}</p>
                <img src="assets/images/${icon}" alt="">
                <div class="temps">
                    <p class="daily-min">${Math.round(min)}${getTempUnitSymbol()}</p>
                    <p class="daily-max">${Math.round(max)}${getTempUnitSymbol()}</p>
                </div>
            </div>
        `;

        dailyContainer.innerHTML += card;

    });

    renderDayDropdown();

}

function renderDayDropdown() {

    const daysPanel = document.querySelector(".days-panel");
    const daysBtn = document.querySelector(".days-toggler");

    daysPanel.innerHTML = "";

    weatherState.daily.time.forEach(dateString => {

        const date = new Date(dateString);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "long"
        });

        const button = document.createElement("button");
        button.classList.add("days-option");
        button.textContent = dayName;

        button.addEventListener("click", () => {

            weatherState.selectedDay = dateString;

            daysBtn.innerHTML = `
                ${dayName}
                <img src="assets/images/icon-dropdown.svg" alt="">
            `;

            renderHourly();

            daysPanel.classList.remove("open");
        });

        daysPanel.appendChild(button);
    });
}

function renderSelectedDayWeather(selectedDate) {

    const index = weatherState.hourly.time.findIndex(time =>
        time.startsWith(selectedDate)
    );

    if (index === -1) return;

    let temp = weatherState.hourly.temperature_2m[index];
    let wind = weatherState.wind;
    let rain = weatherState.hourly.precipitation[index];
    let feels = weatherState.hourly.apparent_temperature[index];
    let humidity = weatherState.hourly.relative_humidity_2m[index];

    if (units.temperature === "fahrenheit") {
        temp = (temp * 9/5) + 32;
        feels = (feels * 9/5) + 32;
    }

    if (units.precipitation === "in") {
        rain = rain * 0.0393701;
    }

    document.querySelectorAll(".main-temp")
        .forEach(el => el.textContent = Math.round(temp) + getTempUnitSymbol());

    document.querySelector(".feels-like").textContent =
        Math.round(feels) + getTempUnitSymbol();

    document.getElementById("humidity").textContent =
        humidity + "%";

    document.getElementById("precipitation").textContent =
        rain.toFixed(1) + (units.precipitation === "mm" ? " mm" : " in");
}


//Hourly Render

function renderHourly() {

    if (!weatherState.hourly || !weatherState.selectedDay) return;

    const container = document.getElementById("hourly-container");
    container.innerHTML = "";

    const times = weatherState.hourly.time;

    times.forEach((timeString, index) => {

        const datePart = timeString.split("T")[0];

        if (datePart !== weatherState.selectedDay) return;

        let temp = weatherState.hourly.temperature_2m[index];
        let code = weatherState.hourly.weathercode[index];

        if (units.temperature === "fahrenheit") {
            temp = (temp * 9/5) + 32;
        }

        const date = new Date(timeString);
        const hour = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });

        const icon = getWeatherIcon(code);

        const card = `
            <div class="hour">
                <div class="day-forecast">
                    <img src="assets/images/${icon}" alt="">
                    <p>${hour}</p>
                </div>
                <div>
                    <p>${Math.round(temp)}${getTempUnitSymbol()}</p>
                </div>
            </div>
        `;

        container.innerHTML += card;

    });
}

//Get icons

function getWeatherIcon(code) {

    if (code === 0) return "icon-sunny.webp";
    if (code >= 1 && code <= 3) return "icon-partly-cloudy.webp";
    if (code >= 45 && code <= 48) return "icon-fog.webp";
    if (code >= 51 && code <= 67) return "icon-rain.webp";
    if (code >= 80 && code <= 82) return "icon-rain.webp";
    if (code >= 71 && code <= 77) return "icon-snow.webp";
    if (code >= 95) return "icon-storm.webp";
    return "icon-overcast.webp";
}

//Render Hero

function renderHero() {

    const heroIcon = document.querySelector(".hero-icon");

    if (heroIcon && weatherState.currentCode !== null) {
        const icon = getWeatherIcon(weatherState.currentCode);
        heroIcon.src = `assets/images/${icon}`;
    }

    const cityEl = document.getElementById("city-name");
    if (cityEl && weatherState.city) {
        cityEl.textContent = weatherState.city;
    }

    const dateEl = document.getElementById("date");

    if (dateEl && weatherState.currentTime) {

        const date = new Date(weatherState.currentTime);

        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        dateEl.textContent = formattedDate;
    }
}

//Locate user

function getUserLocation() {

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {

            const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );

            const geoData = await geoResponse.json();

            if (geoData.city && geoData.countryName) {
                weatherState.city = `${geoData.city}, ${geoData.countryName}`;
            }

            
            fetchWeather(lat, lon);
            

        } catch (error) {
            console.log("Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
            alert("Location permission denied.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("Location unavailable.");
        } else if (error.code === error.TIMEOUT) {
            alert("Location request timed out.");
        }
        }

    });
}

document.addEventListener("DOMContentLoaded", () => {

    const locateBtn = document.getElementById('locateBtn');

    locateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        getUserLocation();
    });

    fetchCoordinates("Tokyo");

});