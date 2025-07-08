const cityInput = document.querySelector(".city-input")
const searchButton = document.querySelector(".search-btn")
const locationButton = document.querySelector(".location-btn")
const currentWeather = document.querySelector(".current-weather")
const weatherCards = document.querySelector(".weather-cards")

function unixToDateTime(unixTimestamp, format = 24) {
    // Convert from seconds to milliseconds
    const date = new Date(unixTimestamp * 1000);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (format === 12) {
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds} ${suffix}`;
    } else {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
}



const API_KEY = "6dfece27ee79becc94237671ae4a357e"

const createWeatherCard = (cityName, weatherItem, index, city= null) => {
    if (index === 0) {
        console.log(city)
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Feels Like: ${(weatherItem.main.feels_like - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    <h4>Sunrise: ${unixToDateTime(city.sunrise)}</h4>
                    <h4>Sunset: ${unixToDateTime(city.sunset)}</h4>
                </div>
                 <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="">
                    <h4>${weatherItem.weather[0].description}</h4>
                 </div>`
    } else {
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Feels Like: ${(weatherItem.main.feels_like - 273.15).toFixed()}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
console.log(data);
        const uniqueForecastDays = []
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate()
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate)
            }
        })

        console.log(fiveDaysForecast);

        cityInput.value = "";
        currentWeather.innerHTML = "";
        weatherCards.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, data.city))
            } else {
                weatherCards.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }

        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!")
    })
}

searchButton.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return

    const GECODING_WEATHER_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`

    fetch(GECODING_WEATHER_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`)
        const { name, lat, lon } = data[0]
    
        getWeatherDetails(name, lat, lon)
    }).catch(() => {
        alert("An error occured while fetching the coordinates!")
    })
})

locationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;

            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name} = data[0]
                getWeatherDetails(name, latitude, longitude)
            }).catch(() => {
                alert("An error occured while fetching the city!")
            })
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.")
            }
        }
    )
})
