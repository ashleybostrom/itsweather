// openweather API //
const apiKey = "9b416adf086fffbb0c564aa90f7624d8";
// weather as of now //
var currWeatherDiv = $("#currentWeather");
// 5 day weather forecast //
var forecastDiv = $("#fiveDayForecast");
// array for city //
var citiesArray;

// submit for city 
$(document).ready(function () {
    $("#cityInput").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#submitCity").click();
        }
    });
});

// can search city from icon
$("#submitCity").click(function () {
    event.preventDefault();
    let cityName = $("#cityInput").val();
    localStorage.setItem("currentCity", cityName)
    returnCurrentWeather(cityName);
    returnForecast(cityName);

});

// already searched cities will appear 
$("#previousCities").click(function () {
    let cityName = event.target.value;
    returnCurrentWeather(cityName);
    returnForecast(cityName);

})

// localstorage, will pull up last city that was searched when page is refreshed
if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    let currentCity = localStorage.getItem("currentCity")
    writeSearchHistory(citiesArray);
    returnCurrentWeather(currentCity);
    returnForecast(currentCity);


} else {
    citiesArray = [];

};
// seach history 
function createHistoryButton(cityName) {
    var citySearch = cityName.trim();
    var buttonCheck = $(`#previousSearch > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
        return;
    }

    if (!citiesArray.includes(cityName)) {
        citiesArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray));
    }


    $("#previousSearch").prepend(`
    <button class="btn btn-light cityHistoryBtn" id="cityHistoryButton" value='${cityName}'>${cityName}</button>
        `);
}

// return current weather when clicking
$(".cityHistoryBtn").on("click", function () {
    currWeatherDiv.empty();
    let cityName = $(this).val();
    returnCurrentWeather(cityName);
    returnForecast(cityName);


});
// search history
function writeSearchHistory(array) {
    $.each(array, function (i) {
        createHistoryButton(array[i]);
    })
}

// calling to API for current weather
function returnCurrentWeather(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&APPID=${apiKey}`;

    // info when searched
    $.get(queryURL).then(function (response) {
        // current date 
        let currTime = new Date(response.dt * 1000);
        // icon for weather
        let weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
        // weather info from search
        currWeatherDiv.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth() + 1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="75px"></h2>
        <p>Temperature: ${response.main.temp}&#176;F</p>
        <p>Humidity: ${response.main.humidity}%</p>
        <p>Wind Speed: ${response.wind.speed} mph</p>
        `, uvIndex(response.coord))
        createHistoryButton(response.name);
        localStorage.setItem("cityObject", JSON.stringify(response));
        console.log(response);
    })
};
// uvindex from function
function uvIndex(coordinates) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    $.get(queryURL).then(function (response) {
        let currUVIndex = response.value;
        // color for uvindex
        let uvStrength = "green";
        let textColor = "white"

        // color change for uvindex
        if (currUVIndex >= 8) {
            uvStrength = "red";
            textColor = "white"
        } else if (currUVIndex >= 6) {
            uvStrength = "orange";
            textColor = "black"
        } else if (currUVIndex >= 3) {
            uvStrength = "yellow";
            textColor = "black"
        }
        currWeatherDiv.append(`<p>UV Index: <span class="text-${textColor}" style="background-color: ${uvStrength};">${currUVIndex}</span></p>`);
    })
}

// 5 day forecast from API
function returnForecast(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&APPID=6c0ac38b22e3e819b50460a5a899f855`;

    $.get(queryURL).then(function (response) {
        let forecastInfo = response.list;
        console.log(response);
        forecastDiv.empty();
        $.each(forecastInfo, function (i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }
            // dates of forecast being asked for
            let forecastDate = new Date(forecastInfo[i].dt * 1000);
            // icon for weather
            let weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;
            // data for search
            forecastDiv.append(`
                <div class="card text-white bg-primary">
                    <div class="card-body">
                        <h6>${forecastDate.getMonth() + 1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h6>
                        <img src=${weatherIcon} alt="Icon">
                        <p>Temp: ${forecastInfo[i].main.temp}&#176;F</p>
                        <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
                    </div>
                </div>
            </div>
            `)
        })
    })
};