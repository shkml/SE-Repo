from flask import Flask, render_template, url_for, request, jsonify, redirect
import jinja2
import requests
import json
from datetime import timedelta
import time


# the file "./static/dublin.json" contains the static data of all bike stations in Dublin
# define a function to get the static data which is stored in a json file previously, return a dictionary.
def open_station_json(path, *result_type):
    #  if result_type is json, return json, else return dictionary.
    try:
        stations_json = open(path)
    except IOError:
        print("file dublin.json not found")
    else:
        print('successfully open file dublin.json ')
    finally:
        stations = json.load(stations_json)
        stations_json.close()
    if result_type:
        return stations
    else:
        # Classify the attributes of the bike stations, and store them in the form of list
        station_num = []  # station number
        station_name = []  # station name
        station_addr = []  # station address
        station_coord = []  # station coordinates
        for station in stations:
            station_num.append(station['number'])
            station_name.append(station["name"])
            station_addr.append(station["address"])
            station_coord.append({"lat": station["latitude"], "lng": station["longitude"]})
        return {
            "station_num": station_num,
            "station_name": station_name,
            "station_addr": station_addr,
            "station_coord": station_coord
            }


# The parameters used to fetch DublinBike realtime data.
DB_APIKEY = 'af37588ddccd6b0760b7d0b5b8d77d5004d4917c'
CONTRACT_NAME = 'Dublin'  # contract name
DB_URI = "https://api.jcdecaux.com/vls/v1/stations"


# Define a function to fetch the realtime data
def bike_data_fetch():
    api_request_rt = requests.get(DB_URI, params={"apiKey": DB_APIKEY, "contract": CONTRACT_NAME})
    json_result = json.loads(api_request_rt.text)
    return json_result

station_static = open_station_json('./static/dublin.json', "json")

# Define a function to fetch the weather data
def weather_get(location):
    W_APIKEY = 'c9d5929c3180f174f633828540c0fbc5'
    weather_list =[]
    for i in location:
        LAT = i["lat"]
        LNG = i["lng"]
        weather_r = requests.get("http://api.openweathermap.org/data/2.5/weather?lat={}&lon={}&appid={}".format(LAT, LNG, W_APIKEY))
        weather_result = json.loads(weather_r.text)
        weather_tup = "temp:"+str(weather_result["main"].get("temp"))+"<br> wind:"+str(weather_result["wind"].get("speed"))+"<br> humidity:"+ str(weather_result["main"].get("humidity"))
        weather_list.append(weather_tup)
    return weather_list


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)


@app.route('/')
def index():
    station_dict = open_station_json("./static/dublin.json")
    station_coord = station_dict["station_coord"]
    station_name = station_dict["station_name"]

    center = station_coord[0]
    lat0 = center['lat']
    lng0 = center['lng']

    redo_url = url_for('singleshow')
    redirect(redo_url)
    return render_template("dbike_index.html", lat0=lat0, lng0=lng0, station_name=station_name)

def make_markers():
    result = bike_data_fetch()
    infobox_list = []

    for i in result:
        # get position
        loc = {"lat": i.get("position").get("lat"), "lng": i.get("position").get("lng")}
        weather_info = weather_get([loc])
        weather = weather_info[0]
        # get time
        time_update = i.get('last_update')
        time_update = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        info = 'Name: ' + i.get('name') + '<br>' + \
               'Address:' + i.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(i.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(i.get('available_bikes')) + '<br>' + \
               i.get('status') + '<br>' + time_update +'<br>' + \
                weather


        infobox_list.append({"loc": loc, "info": info, "name": i.get('name')})
    return infobox_list
@app.route('/add_markers', methods=['GET'])
def add_marker():
    result = bike_data_fetch()
    infobox_list = []

    for i in result:
        # get position
        loc = {"lat": i.get("position").get("lat"), "lng": i.get("position").get("lng")}
        weather_infolist = weather_get([loc])
        weather = weather_infolist[0]
        # get time
        time_update = i.get('last_update')
        time_update = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        info = 'Name: ' + i.get('name') + '<br>' + \
               'Address:' + i.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(i.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(i.get('available_bikes')) + '<br>' + \
               i.get('status') + '<br>' + time_update +weather
        infobox_list.append({"loc": loc, "info": info, "name": i.get('name')})
    return jsonify(infobox_list)


@app.route('/singleshow', methods=['POST'])
def singleshow():
    selected_value = request.form.get('selected_value')
    sel_value = json.loads(selected_value)
    if sel_value == 'ALL':
        infobox_list = make_markers()
        return jsonify(infobox_list)
    else:
        result = bike_data_fetch()
        station = {}
        for i in result:
            if i["name"] == sel_value:
                station = i
        else:
            print(sel_value,"  ", station["name"])
        # get position
        loc = {"lat": station.get("position").get("lat"), "lng": station.get("position").get("lng")}
        weather_infolist = weather_get([loc])

        # get time
        time_update = station.get('last_update')
        time_update = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        info = 'Name: ' + station.get('name') + '<br>' + \
               'Address:' + station.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(station.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(station.get('available_bikes')) + '<br>' + \
               station.get('status') + '<br>' + time_update
        weather = weather_infolist[0]
        all_info = info + "<br>" + weather
        lat0 = loc['lat']
        lng0 = loc['lng']
        return jsonify({"lat0":lat0, "lng0":lng0, "all_info":all_info})


if __name__ == '__main__':
    app.run()
