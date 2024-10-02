// API key and URL
const apiKey = "857b9b0570986dcc36e9622921367ed3";
const apiUrl = `https://api.openweathermap.org/data/2.5/`;

// Elements selection
const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector("#searchButton");
const weatherIcon = document.querySelector(".weather-icon");
const forecastContainer = document.getElementById("forecastContainer");
const favoritesList = document.getElementById("favoritesList");
// Get the appropriate weather icon
function getWeatherIcon(weather) {
    const icons = {
        "Clouds": "images/clouds.png",
        "Clear": "images/sun.png",
        "Rain": "images/rainy.png",
        "Drizzle": "images/drizzle.png",
        "Mist": "images/fog.png",
        "Snow": "images/snow.png",
    };
    return icons[weather] || "images/question-mark.png";
}
// Fetch weather data by city name or coordinates
function fetchWeather(city = "Stockholm", lat = null, lon = null) {
    const url = lat && lon 
        ? `${apiUrl}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        : `${apiUrl}weather?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.cod===200){
                displayWeather(data);
                fetchForecast(data.name);
            } else {
                alert("City not found");
            }
        })
        .catch(() => alert("Failed to retrieve data"));
}

// Display weather data
function displayWeather(data) {
    document.querySelector(".city").textContent=data.name;
    document.querySelector(".temp").textContent=`${Math.round(data.main.temp)}°C`;
    document.querySelector(".humidity").textContent=`${data.main.humidity}%`;
    document.querySelector(".wind").textContent = `${data.wind.speed} km/h`;
    weatherIcon.src = getWeatherIcon(data.weather[0].main);
}




// Fetch 5-day forecast data
function fetchForecast(city) {
    fetch(`${apiUrl}forecast?q=${city}&units=metric&appid=${apiKey}`)

        .then(response => response.json())
        .then(data => displayForecast(data.list))
        .catch(() => alert("Failed to retrieve forecast data"));
}
// Display forecast data
function displayForecast(forecastList) {
    // Clear out any previous forecast displayed
    forecastContainer.innerHTML="";
    
    // Create an empty object to store data for each day
    const dailyData = {};
    // Go through each forecast item one by one
    forecastList.forEach(item => {
        // Convert timestamp to a readable date ( for example:"10/1/2024")
        const date = new Date(item.dt * 1000).toLocaleDateString();
        
         // Check if we already have data for this date, if not, create an empty arra
        if (!dailyData[date]) {
            dailyData[date] = [];
        }

        // Add this forecast item to the array for that date
        dailyData[date].push(item);
    });

    // Iterate over each day's data to display accurate min/max
    for (const [date, dayData] of Object.entries(dailyData)) {
        const minTemp = Math.min(...dayData.map(item => item.main.temp_min));
        const maxTemp = Math.max(...dayData.map(item => item.main.temp_max));
        
        const weatherIcon = getWeatherIcon(dayData[0].weather[0].main); 
        
        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <h5>${date}</h5>
                <img src="${weatherIcon}" alt="${dayData[0].weather[0].main}">
                <p>Min: ${Math.round(minTemp)}°C</p>
                <p>Max: ${Math.round(maxTemp)}°C</p>
            </div>
        `;
    }
}
// Save and display favorite locations
function handleFavorite(city) {
    // Retrieve the list of favorite cities from localStorage, or start with an empty list if none exist
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(city)) {
        // Add the city to the favorites list
        favorites.push(city);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavorites();
    }
}

// Display saved favorite locations
function updateFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesList.innerHTML = ""; 

    favorites.forEach((city) => {
        const li = document.createElement('li');
        li.textContent = city;

        const deleteIcon = document.createElement('img');
        deleteIcon.src = "images/trash.png"; 
        deleteIcon.alt = "Delete";
        deleteIcon.style.width = "20px"; 
        deleteIcon.style.height = "20px";
        deleteIcon.style.marginLeft = "10px";
        deleteIcon.style.cursor = "pointer";
        
        deleteIcon.addEventListener('click', () => {
            removeFavorite(city);
        });

        li.appendChild(deleteIcon);
        favoritesList.appendChild(li);
    });
}

// Function to remove a city from favorites
function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(favorite => favorite !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();
}

// Initialize app
function initializeApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeather(null, position.coords.latitude, position.coords.longitude);
        }, () => fetchWeather());
    } else {
        fetchWeather();
    }
    updateFavorites();
}

// Event listeners
searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
        handleFavorite(city);
    } else {
        alert("Please enter a city name");
    }
});

// Add an event listener for the "Enter" key
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
            handleFavorite(city);
        } else {
            alert("Please enter a city name");
        }
    }
});

initializeApp();
