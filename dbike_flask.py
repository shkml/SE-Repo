from flask import Flask, render_template, url_for, request, jsonify, redirect
import jinja2
import requests
import json
from datetime import timedelta
import time
import pickle
import sklearn


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
    return render_template("index.html", lat0=lat0, lng0=lng0, station_name=station_name)

def make_markers():
    result = bike_data_fetch()
    infobox_list = []

    for i in result:
        # get position
        loc = {"lat": i.get("position").get("lat"), "lng": i.get("position").get("lng")}

        time_update = i.get('last_update')
        time_update = time.strftime("%Y/%m/%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        info = 'Name: ' + i.get('name') + '<br>' + \
               'Address:' + i.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(i.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(i.get('available_bikes')) + '<br>' + \
               i.get('status') + '<br>' + time_update +'<br>'
        infobox_list.append({"loc": loc, "info": info, "name": i.get('name')})
    return infobox_list


@app.route('/add_markers', methods=['GET'])
def add_marker():
    result = bike_data_fetch()
    infobox_list = []

    for i in result:
        # get position
        loc = {"lat": i.get("position").get("lat"), "lng": i.get("position").get("lng")}

        # get time
        time_update = i.get('last_update')
        time_update = time.strftime("%Y/%m/%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        info = 'Name: ' + i.get('name') + '<br>' + \
               'Address:' + i.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(i.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(i.get('available_bikes')) + '<br>' + \
               i.get('status') + '<br>' + time_update
        infobox_list.append({"loc": loc, "info": info, "name": i.get('name'),"lastupdate":time_update})
    return jsonify(infobox_list)


@app.route('/singleshow', methods=['GET', 'POST'])
def singleshow():
    sel_value = request.args.get('selected_value')
    if sel_value == 'ALL':
        infobox_list = make_markers()
        return jsonify(infobox_list)
    else:
        result = bike_data_fetch()
        station = {}
        for i in result:
            if i["name"] == sel_value:
                station = i
                break
        else:
            print(sel_value, "  ", station["name"])

        # get position
        loc = {"lat": station.get("position").get("lat"), "lng": station.get("position").get("lng")}

        # get time
        time_update = station.get('last_update')
        time_update = time.strftime("%Y/%m/%d %H:%M:%S", time.localtime(time_update / 1000))

        # integrate the information
        name = station.get('name')
        ava_stads = str(station.get('available_bike_stands'))
        ava_bikes = str(station.get('available_bikes'))

        info = 'Name: ' + station.get('name') + '<br>' + \
               'Address:' + station.get('address') + '<br>' + \
               'Avaliable Bike Stands:' + str(station.get('available_bike_stands')) + '<br>' + \
               'Avaliable Bikes:' + str(station.get('available_bikes')) + '<br>' + \
               station.get('status') + '<br>' + time_update
        ava_data = {"name":name, "bikes":ava_bikes, "stands":ava_stads, "status":station.get('status')}
        all_info = info
        lat0 = loc['lat']
        lng0 = loc['lng']
        return jsonify({"lat0":lat0, "lng0":lng0, "all_info":all_info, "lastupdate":time_update,"ava_data":ava_data})


@app.route('/getweather', methods=['GET'])
# Define a function to fetch the weather data
def getweather():
    W_APIKEY = 'c9d5929c3180f174f633828540c0fbc5'
    sel_station = request.args.get("selected_sta")
    sta = {}
    result = bike_data_fetch()
    if sel_station == 'ALL':
        sta = result[0]
    else:
        for i in result:
            if i["name"] == sel_station:
                print(i)
                sta = i
                break
        else:
            if not sta['name']:
                raise
            # get position
    loc = {"lat": sta.get("position").get("lat"), "lng": sta.get("position").get("lng")}
    LAT = loc['lat']
    LNG = loc['lng']
    weather_dict = {}
    weather_r = requests.get(
        "http://api.openweathermap.org/data/2.5/weather?lat={}&lon={}&appid={}".format(LAT, LNG, W_APIKEY))
    weather_result = json.loads(weather_r.text)

    h_temp = weather_result["main"].get("temp")
    weather_dict["temp"] = str(round(h_temp - 273.15)) + '˚C'
    weather_dict["main"] = str(weather_result["weather"][0].get('main'))
    weather_dict["wind"] = str(weather_result["wind"].get("speed")) + 'm/s'
    # weather_tup = "temp:"+str(weather_result["main"].get("feels_like"))+"<br> wind:"+str(weather_result["wind"].get("speed"))+"<br> humidity:"+ str(weather_result["main"].get("humidity"))
    print(weather_dict)
    return jsonify(weather_dict)


@app.route('/graphdata', methods=['GET', 'POST'])
def graphdata():
    try:
        bd_json = open('./static/processedBikeData.json')
    except IOError:
        print("file dublin.json not found")
    else:
        print('successfully open file dublin.json ')
    finally:
        gdata = json.load(bd_json)
        bd_json.close()
    staname = request.args.get("selected_sta")
    GRAPHDATA = {}
    for i in gdata:
        if i == staname:
            print(gdata[i])
            GRAPHDATA = gdata[i]
    return jsonify(GRAPHDATA)


@app.route("/showprediction", methods=['GET', 'POST'])
def showprediction():
    print('enter show')
    # get station name and selected time from UI
    staname = request.args.get('staname')
    Time = float(request.args.get('time'))
    Time /= 1000
    # staname = 'UPPER SHERRARD STREET'
    # Time = time.time()
    print(Time)

    # get sta_num
    WP_APIKEY = '9570260da25526e20bf66bdf7e1c25e5'
    sta = {}
    result = bike_data_fetch()
    for i in result:
        if i["name"] == staname:
            print(i)
            sta = i
            stn_num = i['number']
            status = i['status']
            break
    else:
        if not sta['name']:
            raise

    # get LAT, LNG
    loc = {"lat": sta.get("position").get("lat"), "lng": sta.get("position").get("lng")}
    LAT = loc['lat']
    LNG = loc['lng']

    # get temp
    weather_p = requests.get(
        "http://api.openweathermap.org/data/2.5/forecast?lat={}&lon={}&appid={}".format(LAT, LNG, WP_APIKEY))
    weather_result = json.loads(weather_p.text)
    print(weather_result)
    for i in weather_result.get('list'):
        if i.get('dt') - Time <= 60 * 60 * 3:
            temp = round(i.get('main').get('feels_like') - 273.15, 2)
            weather = i.get('weather')[0].get('main')
            print((time.localtime(i.get('dt'))).tm_hour)
    print(temp, weather)

    # get hour
    hour = (time.localtime(Time)).tm_hour
    print(hour)
    # get hour list for the parameter of prediction
    hour_l = [0, 0, 0]
    if hour > 11:
        hour_l[2] = 1
        hour_l[0] = hour - 12
    else:
        hour_l[1] = 1

    # get week list for the parameter of prediction
    weeklist = [0 for i in range(7)]
    w_index = (time.localtime(Time).tm_wday)
    weeklist[w_index] = 1

    # predict stands
    with open('./static/PickelFiles/' + str(stn_num) + '_bikeStands.pkl', 'rb') as read:
        pre_stands = pickle.load(read)
    print([hour_l + weeklist])
    available_stands = pre_stands.predict([hour_l + weeklist])[0]
    available_stands = int(round(available_stands))
    print((available_stands))
    read.close()

    # predict bikes
    with open('./static/PickelFiles/' + str(stn_num) + '.pkl', 'rb') as read:
        pre_bikes = pickle.load(read)
    paralist = hour_l + [temp] + [available_stands] + weeklist
    print(paralist)
    available_bikes = pre_bikes.predict([paralist])[0]
    available_bikes = int(round(available_bikes))
    print(available_bikes)
    result = {"avabikes": available_bikes, "avastands": available_stands, "weather": weather, 'status': status}
    return jsonify(result)

if __name__ == '__main__':
    app.run()
