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
	location = document.getElementById("location");
	console.log(location.value);
}