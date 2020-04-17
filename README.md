# SE-Repo
Project Name: DUBLIN BIKES
Project Members: Komal Sharma, Guosheng Li and Boheng Ding

INTRODUCTION:
This project is a part of module COMP30830 Software Engineering(Conv) carried out at UCD. The project is used to produce a Web application to show the DublinBikes availability at any given station(110 stations), available bike stands and weather information. The web application can also give predictions(e.g, how many bikes will be available after at x hours). This project is a standalone web application to help Dublin Bike users to get useful information, ease the travel and enjoy cycling. 

MAIN FEATURES:
-	Map interaction to show all stations on map
-	Bike availability (daily and hourly)
-	Bike stands availability
-	Weather information for each station
-	Bike prediction for next 24 hours

MEMBERS:
- Professor: Dr. Aonghus Lawlor
- Project owner: Shreya Tadas
- Project members and contribution (only main jobs are listed, all the group members were involved in different jobs):
  -	Guosheng Li (34%): Flask app frame, web UI, weather data scraper
  -	Komal Sharma (34%): bike data scraper, Machine learning model and Deployment
  -	Boheng Ding (32%): web UI, JavaScript, Documentation (meeting minutes, group report etc.), 

USED TOOLS:
-	Languages - Python, Javascript, HTML and CSS
-	Flask framework
-	PyCharm
-	GitHub
- Brackets
-	AWS EC2
- AWS RDS
-	MySQL

DELIVERABLES:
- This project is executed from the file "dbike_flask.py", which will initialize the user interface and show the webpage.
- Other 'py' files are only used at the starting stage, they are used to fetch the data and save to data to databse. Once the data is fetched and stored, they will not be used again.
- The html files are contained in the folder "templates", actually only index.html is needed, other file(s) was made only for testing.
- The css or js files are all contained in the 'static' folder, so when run the web application please do not change the path, otherwise the css and js files are not accessable. Some other supporting files like pictures or icons are also stored in the 'static' folder.
- The requirements.txt file gives the information about the packages needed in this project. When the projected is executed at a new environment, the instruction 'pip install -r requirements.txt' should be executed in the terminal firstly to install the necessary python packages.
- 'ML Model' folder contains the files and script made/used in machine learning model, the resulted model(pickel files) are also stored in the this folder.
- 'dbv' contains the packages about the virtual environment in which this project is developed.
