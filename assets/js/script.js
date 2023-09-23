$(document).ready(function () {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  var apiKey = "2c9bcb2e033ed7202d80b7f29fc73541";

  renderSearchHistory()

//function to display search history
  function renderSearchHistory() {
    var historyContainer = $("#search-history");
    //clear buttons so they don't repeat
    historyContainer.empty(); 
    for (var i = 0; i < searchHistory.length; i++) {
      var historyBtn = $("<button>");
      historyBtn.text(searchHistory[i]);
      historyBtn.addClass("history-btn");
      historyContainer.append(historyBtn);
    }
  }
  
  $('.history-btn').on("click", function () {
    searchForCity($(this).text());
  });

  //search button functionality
  $("#search-button").on("click", function () {
    var inputValue = $("#search-input").val();
    //checks if there is an input value, and wether or not its included in the search history, and if so it gets pushed to the array, and set into local storage
    if (inputValue && !searchHistory.includes(inputValue)) {
      searchHistory.push(inputValue);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      renderSearchHistory();
    }

    if (inputValue) {
      searchForCity(inputValue);
    }
  });

  //first api run to get the latitude/longitude of our cities required for the second api call
  function searchForCity(cityName) {
    var apiUrl =
      "https://api.openweathermap.org/geo/1.0/direct?" +
      "q=" +
      cityName +
      "&limit=5&appid=" +
      apiKey;
    fetch(apiUrl)
      //checks the status of the response, if it fails gives an error message, if it succeeds, convert into a usable object with json
      .then(function (response) {
        if (!response.ok) {
          console.error("Network response failed");
          return;
        }
        return response.json();
      })
      .then(function (data) {
        var lat = data[0].lat;
        var lon = data[0].lon;
        var secondApiUrl =
          "https://api.openweathermap.org/data/2.5/forecast?" +
          "lat=" +
          lat +
          "&lon=" +
          lon +
          "&appid=" +
          apiKey;
        //second api fetch, using json to convert the data again
        fetch(secondApiUrl)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data);
            var mainContainer = document.getElementById("current-weather");
            var forecastContainer =
              document.getElementById("forecast-container");
            var weatherHTML = displayWeatherData(
              data.list[0],
              data.city.name,
              true
            );
            mainContainer.style.height = "auto";
            mainContainer.innerHTML = weatherHTML;
            // looped 5 times for the 5 smaller containers we have
            for (let i = 0; i < 5; i++) {
              var forecastHTML = displayWeatherData(
                data.list[i * 8 + 1],
                data.city.name,
                false
              );
              forecastContainer.children[i].innerHTML = forecastHTML;
            }
          });
        $("#search-input").val("");

        //this function gets the wanted information from our api call
        function displayWeatherData(data, cityName, isCurrent) {
          var date = dayjs.unix(data.dt);
          var tempF = ((data.main.temp - 273.15) * 9) / 5 + 32;
          //results in a number with a lot of decimals, this removes all but the first two
          tempF = Math.round(tempF * 10) / 10;
          var windSpeed = data.wind.speed;
          var humidity = data.main.humidity;
          var weatherIcon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
          var dateString = date.format("MM/DD/YYYY");
          if (isCurrent) {
            header =
              "<h2>" +
              cityName +
              " (" +
              dateString +
              ')<img src="' +
              weatherIcon +
              '" alt="' +
              data.weather[0].description +
              '" /></h2>';
          } else {
            header =
              "<h5>" +
              dateString +
              '<img src="' +
              weatherIcon +
              '" alt="' +
              data.weather[0].description +
              '" /></h5>';
          }
          //puts all our different variables together and then returns that value to the innerhtml of our containers
          var weatherDataHTML =
            header +
            "<p>Temp: " +
            tempF +
            " °F</p>" +
            "<p>Wind: " +
            windSpeed +
            " MPH</p>" +
            "<p>Humidity: " +
            humidity +
            "%</p>";

          return weatherDataHTML;
        }
      });
  }
});