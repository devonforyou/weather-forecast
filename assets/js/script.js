$(document).ready(function () {
    //getting the search history from local storage and setting it to a variable or an empty array
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  var apiKey = "2c9bcb2e033ed7202d80b7f29fc73541";

  renderSearchHistory()

//this funciton displays the search history
  function renderSearchHistory() {
    //target the correct div in the html
    var historyContainer = $("#search-history");
    //clear buttons so they don't repeat
    historyContainer.empty(); 
    //iterate
    for (var i = 0; i < searchHistory.length; i++) {
      var historyBtn = $("<button>");
      historyBtn.text(searchHistory[i]);
      historyBtn.addClass("history-btn");
      historyContainer.append(historyBtn);
    }
  }
  
  //instead of storing all of the data in local storage, i run the function with the city name as a parameter again, making for less code/it updates the information and stays accurate
  $('.history-btn').on("click", function () {
    searchForCity($(this).text());
  });

  //search button functionality, takes inputValue and gives it to the searchforcity function
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
    //creating the url for the first api call
    var apiUrl =
      "https://api.openweathermap.org/geo/1.0/direct?" +
      "q=" +
      cityName +
      "&limit=5&appid=" +
      apiKey;
    //fetching the data
    fetch(apiUrl)
      //checks the status of the response, if it fails gives an error message, if it succeeds, convert into a usable object with json
      .then(function (response) {
        if (!response.ok) {
          console.error("Network response failed");
          return;
        }
        return response.json();
      })
      //putting our long and lat into variabled
      .then(function (data) {
        var lat = data[0].lat;
        var lon = data[0].lon;
        //creating the url for the second api fetch
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
            //setting the containers we want to target to variables
            var mainContainer = document.getElementById("current-weather");
            var forecastContainer =
              document.getElementById("forecast-container");
            //these blocks of code call the displayweather function with the right parameters in it, and when the data from the function is returned, sets the innerHTML of our desired containers to that content
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
        //clears our search input field
        $("#search-input").val("");

        //this function extracts the wanted information from our api call, and displays it in the correct fashion
        function displayWeatherData(data, cityName, isCurrent) {
          //the date in the api information is in a unix timestamp, so we convert it to a date we can use
          var date = dayjs.unix(data.dt);
          //the temp degrees come in Kelvin by default when we do the api call, so i convert it to the desired Farenheit with the following formula
          var tempF = ((data.main.temp - 273.15) * 9) / 5 + 32;
          //results in a number with a lot of decimals, this removes all but the first two
          tempF = Math.round(tempF * 10) / 10;
          var windSpeed = data.wind.speed;
          var humidity = data.main.humidity;
          //icons require a custom link to be displayed, this line fetches the data for the proper icon from the api call, and places it into the link in the same line using the ` format
          var weatherIcon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
          var dateString = date.format("MM/DD/YYYY");
          //in order to have slightly different designs for the main container, and the smaller ones yet have them still be made in the same function, the third isCurrent parameter was added, if the isCurrent parameter is true
          //we display it in a larger font style <h2> and include the city name
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
