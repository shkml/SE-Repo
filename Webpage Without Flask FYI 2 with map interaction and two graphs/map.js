var eventArr = []
google.load("visualization", "1", {
    packages: ["corechart"]
});

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(53.345, -6.26),
        zoom: 13.2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var url = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=af37588ddccd6b0760b7d0b5b8d77d5004d4917c";


    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            data = JSON.parse(xmlhttp.responseText);

            for (i = 0; i < 200; i++) {
                //use color to show the available bikes
                var color;
                if (data[i].available_bikes / data[i].bike_stands < 0.10) {
                    color = 'red';
                } else if (data[i].available_bikes / data[i].bike_stands > 0.6) {
                    color = 'green';
                } else {
                    color = 'orange';
                };

                //use radius to show the available stands
                var radius;
                if (data[i].available_bike_stands / data[i].bike_stands < 0.10) {
                    radius = 50;
                } else if (data[i].available_bike_stands / data[i].bike_stands > 0.6) {
                    radius = 150;
                } else {
                    radius = 100;
                };


                circle = new google.maps.Circle({
                    strokeColor: color,
                    strokeOpacity: 1,
                    strokeWeight: 1,
                    fillColor: color,
                    fillOpacity: 0.5,
                    map: map,
                    radius: radius,
                    clickable: true,
                    center: {
                        lat: data[i].position.lat,
                        lng: data[i].position.lng
                    },
                });

                getWeatherData(data[i].position.lat, data[i].position.lng, map, circle, data[i])

            }
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

}

function makeClickable(map, circle, dataItem) {

    var displayInfo = "<h3 style=\"margin:5px;\">" + dataItem.address +
        "</h3><span style=\"text-align:left;font-size:15px;color:grey;\">Bikes Available: " + dataItem.available_bikes +
        "</br>Bike Stands Free: " + dataItem.available_bike_stands +
        "</br>Total Stands: " + dataItem.bike_stands +
        "</br>Status: " + dataItem.status +
        "</br>Weather: " + dataItem.weather +
        "</br>Temperature: " + dataItem.temp +
        "</br>Wind Speed: " + dataItem.windSpeed +
        "</br>Humidity: " + dataItem.humidity +
        "</span></br>";

    var infowindow = new google.maps.InfoWindow({
        content: displayInfo
    });

    google.maps.event.addListener(circle, 'click', function(ev) {
        infowindow.setPosition(circle.getCenter());
        infowindow.open(map);
        getBikesData(dataItem.address);
    });
}

/* To fetch the Data from API*/

var request = new XMLHttpRequest()

request.open('GET', 'https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=af37588ddccd6b0760b7d0b5b8d77d5004d4917c', true)

request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)

    if (request.status >= 200 && request.status < 400) {
        createLocationDropdown(data);
    } else {
        console.log('error');
    }
}

request.send();

//Function to create a dropdown containing the address of the bikes location
function createLocationDropdown(jsonContent) {

    //Creating a set to store all the locations
    let Location = new Set();

    for (var i = 0; i < jsonContent.length; i++) {
        //Iterting over the length of the json and appending the found location in the set 'Location'
        Location.add(jsonContent[i].address);
    }

    //Default dropdown 
    var locationInfo = "<option hidden disabled selected value>Select location</option>";

    //Once set is made, iterate its elements and create a dropdown
    for (let i of Location) {
        locationInfo += "<option value=\"" + i + "\">" + i + "</option>";
    }

    // Sending the data (dropdown) to the id location
    document.getElementById("location").innerHTML = locationInfo;
}

//This function will be called when user will select some location and click on submit button
function showMap() {
    var location = document.getElementById("location");
    getBikesData(location.value);
    selectEvent(location.value);
}

// get weather data
function getWeatherData(lat, lon, map, circle, dataItem) {
    var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=d8e2e95127da1c8f72171c28f62ec2ac";
    // create xmlhttp
    var xmlhttp = new XMLHttpRequest();
    // read the state change
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            // sort the data
            data = JSON.parse(xmlhttp.responseText)
            dataItem.weather = data.weather[0].main;
            dataItem.temp = (data.main.temp - 273.15).toFixed(2);
            dataItem.windSpeed = data.wind.speed;
            dataItem.humidity = data.main.humidity;
            makeClickable(map, circle, dataItem);
            setEvent(map, circle, dataItem);
        }
    }
    // open the url
    xmlhttp.open('get', url, true);
    // 3rd: asynchronous request(true/flase)
    // send data
    xmlhttp.send();
}

// get data for each position 
function getBikesData(locationValue) {
    var oneWeekData = {
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': [],
        'Saturday': [],
        'Sunday': []
    }
    // get data of 16th March to 22nd March form BikesData.js (for testing js script)
    bikesData.forEach(function(val, index) {
        if (val.address == locationValue) {
            // sort the data
            if (val.last_update < 1584374400000)
                oneWeekData.Monday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584374400000 && val.last_update < 1584460800000)
                oneWeekData.Tuesday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584460800000 && val.last_update < 1584547200000)
                oneWeekData.Wednesday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584547200000 && val.last_update < 1584633600000)
                oneWeekData.Thursday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584633600000 && val.last_update < 1584720000000)
                oneWeekData.Friday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584720000000 && val.last_update < 1584806400000)
                oneWeekData.Saturday.push(parseInt((val.available_bikes / val.bike_stands) * 100))

            if (val.last_update > 1584806400000)
                oneWeekData.Sunday.push(parseInt((val.available_bikes / val.bike_stands) * 100))
        }
    })
    // show google chart
    google.charts.setOnLoadCallback(drawBarChart(oneWeekData));
    google.charts.setOnLoadCallback(drawLineChart(oneWeekData));
}


// use Google Chart Api to draw bar chart
function drawBarChart(oneWeekData) {

    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Day');
    data.addColumn('number', 'percent');

    // the total number of each day
    var mondayTotal = 0;
    var tuesdayTotal = 0;
    var wednesdayTotal = 0;
    var thursdayTotal = 0;
    var fridayTotal = 0;
    var saturdayTotal = 0;
    var sundayTotal = 0;

    for (var i = 0; i < 6; i++) {
        mondayTotal += oneWeekData.Monday[i];
        tuesdayTotal += oneWeekData.Tuesday[i];
        wednesdayTotal += oneWeekData.Wednesday[i];
        thursdayTotal += oneWeekData.Thursday[i];
        fridayTotal += oneWeekData.Friday[i];
        saturdayTotal += oneWeekData.Saturday[i];
        sundayTotal += oneWeekData.Sunday[i];
    }

    data.addRows([
        ['Mon', mondayTotal / 6],
        ['Tues', tuesdayTotal / 6],
        ['Wed', wednesdayTotal / 6],
        ['Thur', thursdayTotal / 6],
        ['Fri', fridayTotal / 6],
        ['Sat', saturdayTotal / 6],
        ['Sun', sundayTotal / 6]
    ]);


    var options = {
        'title': 'Bike Availability by Day of a Week',
        'width': 500,
        'height': 300,
        vAxis: {
            maxValue: 100
        }
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    chart.draw(data, options);
}

// Use Goole chart to draw line chart
function drawLineChart(oneWeekData) {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Day');
    data.addColumn('number', 'Mon');
    data.addColumn('number', 'Tues');
    data.addColumn('number', 'Wed');
    data.addColumn('number', 'Thur');
    data.addColumn('number', 'Fri');
    data.addColumn('number', 'Sat');
    data.addColumn('number', 'Sun');

    data.addRows([
        ['00:00', oneWeekData.Monday[0],
            oneWeekData.Tuesday[0],
            oneWeekData.Wednesday[0],
            oneWeekData.Thursday[0],
            oneWeekData.Friday[0],
            oneWeekData.Saturday[0],
            oneWeekData.Sunday[0]
        ],
        ['04:00', oneWeekData.Monday[1],
            oneWeekData.Tuesday[1],
            oneWeekData.Wednesday[1],
            oneWeekData.Thursday[1],
            oneWeekData.Friday[1],
            oneWeekData.Saturday[1],
            oneWeekData.Sunday[1]
        ],
        ['08:00', oneWeekData.Monday[2],
            oneWeekData.Tuesday[2],
            oneWeekData.Wednesday[2],
            oneWeekData.Thursday[2],
            oneWeekData.Friday[2],
            oneWeekData.Saturday[2],
            oneWeekData.Sunday[2]
        ],
        ['12:00', oneWeekData.Monday[3],
            oneWeekData.Tuesday[3],
            oneWeekData.Wednesday[3],
            oneWeekData.Thursday[3],
            oneWeekData.Friday[3],
            oneWeekData.Saturday[3],
            oneWeekData.Sunday[3]
        ],
        ['16:00', oneWeekData.Monday[4],
            oneWeekData.Tuesday[4],
            oneWeekData.Wednesday[4],
            oneWeekData.Thursday[4],
            oneWeekData.Friday[4],
            oneWeekData.Saturday[4],
            oneWeekData.Sunday[4]
        ],
        ['20:00', oneWeekData.Monday[5],
            oneWeekData.Tuesday[5],
            oneWeekData.Wednesday[5],
            oneWeekData.Thursday[5],
            oneWeekData.Friday[5],
            oneWeekData.Saturday[5],
            oneWeekData.Sunday[5]
        ],
        ['24:00', oneWeekData.Monday[6],
            oneWeekData.Tuesday[6],
            oneWeekData.Wednesday[6],
            oneWeekData.Thursday[6],
            oneWeekData.Friday[6],
            oneWeekData.Saturday[6],
            oneWeekData.Sunday[6]
        ]
    ]);

    var options = {
        'title': 'Bike Availability by Time of a Day',
        'width': 500,
        'height': 300,
        vAxis: {
            maxValue: 100
        }
    };
    var chart = new google.visualization.LineChart(document.getElementById('lineChart'));
    chart.draw(data, options);
}

function setEvent(map, circle, dataItem) {
    var event = {
        "map": map,
        "circle": circle,
        "dataItem": dataItem
    }
    eventArr.push(event);
}

function selectEvent(address) {
    eventArr.forEach(function(val, index) {
        if (address == val.dataItem.address) {
            var displayInfo = "<h3 style=\"margin:5px;\">" + val.dataItem.address +
                "</h3><span style=\"text-align:left;font-size:15px;color:grey;\">Bikes Available: " + val.dataItem.available_bikes +
                "</br>Bike Stands Free: " + val.dataItem.available_bike_stands +
                "</br>Total Stands: " + val.dataItem.bike_stands +
                "</br>Status: " + val.dataItem.status +
                "</br>Weather: " + val.dataItem.weather +
                "</br>Temperature: " + val.dataItem.temp +
                "</br>Wind Speed: " + val.dataItem.windSpeed +
                "</br>Humidity: " + val.dataItem.humidity +
                "</span></br>";

            var infowindow = new google.maps.InfoWindow({
                content: displayInfo
            });

            infowindow.setPosition(val.circle.getCenter());
            infowindow.open(val.map);
        }
    })
}