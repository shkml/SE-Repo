var eventArr = []
google.load("visualization", "1", {packages:["corechart"]});

function initialize() {
    var mapOptions = {
        center:new google.maps.LatLng(53.345,-6.26),
        zoom:13.2,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
    };

    var map=new google.maps.Map(document.getElementById("map"),mapOptions);
    var url="https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=af37588ddccd6b0760b7d0b5b8d77d5004d4917c";


    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                data = JSON.parse(xmlhttp.responseText);

                for (i=0;i<200;i++) {
                    //use color to show the available bikes
                    var color;
                    if (data[i].available_bikes/data[i].bike_stands < 0.10) {
                        color = 'red';
                    } else if (data[i].available_bikes/data[i].bike_stands > 0.6) {
                        color = 'green';
                    } else {
                        color = 'orange';
                    };

                    //use radius to show the available stands
                    var radius;
                    if (data[i].available_bike_stands/data[i].bike_stands < 0.10) {
                        radius = 50;
                    } else if (data[i].available_bike_stands/data[i].bike_stands > 0.6) {
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
                        clickable:true,
                        center: {lat: data[i].position.lat, lng: data[i].position.lng},
                    });

                    getWeatherData(data[i].position.lat, data[i].position.lng, map, circle,data[i])
                    
                } 
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send();

}

function makeClickable(map, circle, dataItem) {
    
    var displayInfo = "<h3 style=\"margin:5px;\">" + dataItem.address
                        + "</h3><span style=\"text-align:left;font-size:15px;color:grey;\">Bikes Available: " + dataItem.available_bikes
                        + "</br>Bike Stands Free: " + dataItem.available_bike_stands
                        + "</br>Total Stands: " + dataItem.bike_stands
                        + "</br>Status: " + dataItem.status
                        + "</br>Weather: " + dataItem.weather
                        + "</br>Temperature: " + dataItem.temp
                        + "</br>Wind Speed: " + dataItem.windSpeed
                        + "</br>Humidity: " + dataItem.humidity
                        + "</span></br>";

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
function createLocationDropdown(jsonContent){

	//Creating a set to store all the locations
	let Location = new Set();  

	for(var i=0;i<jsonContent.length;i++){
		//Iterting over the length of the json and appending the found location in the set 'Location'
		Location.add(jsonContent[i].address);
	}

	//Default dropdown 
	var locationInfo = "<option hidden disabled selected value>Select location</option>";

	//Once set is made, iterate its elements and create a dropdown
	for (let i of Location){
	locationInfo+="<option value=\""+i+"\">"+i+"</option>";
	}

	// Sending the data (dropdown) to the id location
	document.getElementById("location").innerHTML = locationInfo;
}

//This function will be called when user will select some location and click on submit button
function showMap(){
    var location = document.getElementById("location");
    getBikesData(location.value);
    selectEvent(location.value);
}

 // get weather data
 function getWeatherData(lat, lon, map, circle, dataItem){
    var url="http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid=d8e2e95127da1c8f72171c28f62ec2ac";
    // create xmlhttp
    var xmlhttp = new XMLHttpRequest ( ) ;
    // read the state change
    xmlhttp.onreadystatechange=function(){
        if(xmlhttp.readyState===4 && xmlhttp.status===200){
            // sort the data
            data = JSON.parse(xmlhttp.responseText)
            dataItem.weather = data.weather[0].main;
            dataItem.temp = data.main.temp;
            dataItem.windSpeed = data.wind.speed;
            dataItem.humidity = data.main.humidity;
            makeClickable(map, circle, dataItem);
            setEvent(map, circle, dataItem);
        }
   }
    // open the url
    xmlhttp.open('get',url,true);
    // 请求方式  2.发送到哪去  3.是否为异步请求 是true 否 flase
    // 发送数据
    xmlhttp.send();
 }

// get data for each position 
function getBikesData(locationValue){
    var oneWeekData = {
        'Monday':'',
        'Tuesday':'',
        'Wednesday':'',
        'Thursday':'',
        'Friday':'',
        'Saturday':'',
        'Sunday':''
    }
    // get data of 16th March to 22nd March form BikesData.js (for testing js script)
    bikesData.forEach(function(val, index){
        if(val.address == locationValue){
            // sort the data
            if(val.last_update < 1584374400000)
                oneWeekData.Monday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584374400000 && val.last_update < 1584460800000)
                oneWeekData.Tuesday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584460800000 && val.last_update < 1584547200000)
                oneWeekData.Wednesday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584547200000 && val.last_update < 1584633600000)
                oneWeekData.Thursday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584633600000 && val.last_update < 1584720000000)
                oneWeekData.Friday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584720000000 && val.last_update < 1584806400000)
                oneWeekData.Saturday = parseInt((val.available_bikes / val.bike_stands)*100)

            if(val.last_update > 1584806400000)
                oneWeekData.Sunday = parseInt((val.available_bikes / val.bike_stands)*100)
        }
    })
    // show google chart
    google.charts.setOnLoadCallback(drawBarChart(oneWeekData));
}


// use Google Chart Api to generate chart
function drawBarChart(oneWeekData) {
    
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Day');
    data.addColumn('number', 'percent');

    data.addRows([
        ['Mon', oneWeekData.Monday],
        ['Tues', oneWeekData.Tuesday],
        ['Wed', oneWeekData.Wednesday],
        ['Thur', oneWeekData.Thursday],
        ['Fri', oneWeekData.Friday],
        ['Sat', oneWeekData.Saturday],
        ['Sun', oneWeekData.Sunday]
    ]);
    
    
    var options = {'title':'', 'width': 800, 'height': 500, vAxis:{maxValue:100}};
    
    
    var chart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
    chart.draw(data, options);
}


function setEvent(map, circle, dataItem){
    var event = {
        "map":map,
        "circle":circle,
        "dataItem":dataItem
    }
    eventArr.push(event);
}

function selectEvent(address){
    eventArr.forEach(function(val, index){
        if(address == val.dataItem.address){
            var displayInfo = "<h3 style=\"margin:5px;\">" + val.dataItem.address
                        + "</h3><span style=\"text-align:left;font-size:15px;color:grey;\">Bikes Available: " + val.dataItem.available_bikes
                        + "</br>Bike Stands Free: " + val.dataItem.available_bike_stands
                        + "</br>Total Stands: " + val.dataItem.bike_stands
                        + "</br>Status: " + val.dataItem.status
                        + "</br>Weather: " + val.dataItem.weather
                        + "</br>Temperature: " + val.dataItem.temp
                        + "</br>Wind Speed: " + val.dataItem.windSpeed
                        + "</br>Humidity: " + val.dataItem.humidity
                        + "</span></br>";

            var infowindow = new google.maps.InfoWindow({
                content: displayInfo
            });

            infowindow.setPosition(val.circle.getCenter());
            infowindow.open(val.map);
        }
    })
}




















