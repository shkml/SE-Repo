# SE-Repo

Project Members: Komal Sharma, Guosheng Li and Boheng Ding.

The project is used to produce a web application to show the usage situation of a bike station which is built and orgainsed by DublinBikes team. The displayed informations also include weather. Genarally, the user can look through how many bikes and bike stands available in every station. If needed, the web application can also give a prediction about above information.

This project is executed from the file "dbike_flask.py", which will initialize the user interface and show the webpage.

Other 'py' files are only used at the starting stage, they are used to fetch the data and save to data to databse. Once the data are fetched and stored, they will not be used again.

The html files are contained in the folder "templates", actually only index.html is needed, other file(s) is only for test.

The css or js files are all contained in the 'static' folder, so when run the web application please do not chang the path, otherwise the css and js files are not accessable. Some other supporting files like pictures or icons are also stored in the 'static' folder.

The requirements.txt file gives the information about the packages needed in this project. When the projected is executed in a new environment, the instruction 'pip install -r requirements.txt' should be executed in the terminal firstly to install the necssare python packages.
