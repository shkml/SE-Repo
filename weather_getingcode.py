import requests
import json
import mysql.connector
import time
import traceback

def Connect_DB(host,user,passwd,database):
    mydb = mysql.connector.connect(host = host,user = user,passwd = passwd,database = database)
    return mydb

def extract_loc_info(mydb,searched_table,*p):
    #a function to fetch wanted information from the established database
    sql_loc = 'SELECT '
    wanted_info = ""
    for i in p:
        wanted_info += i+','
    else:
        wanted_info = wanted_info[0:-1]
    sql_loc = sql_loc + wanted_info + " FROM " + str(searched_table)+";"
    print(sql_loc)
    mycursor = mydb.cursor()
    mycursor.execute(sql_loc)
    position = mycursor.fetchall()
    position = list(set(position))
    print(len(position))
    mycursor.close()
    return position

def addWeatherData(mydb,data):
    mycursor = mydb.cursor()
    sql_create_weather_table = "CREATE TABLE IF NOT EXISTS WeatherData (latitude float, longitude float, last_update int, temperature float, pressure float, wind_speed float, humidity float);"
    mycursor.execute(sql_create_weather_table)
    time = data["dt"]
    sql = "INSERT INTO WeatherData (latitude, longitude, last_update, temperature, pressure, wind_speed,humidity) VALUES (%s, %s, %s, %s, %s, %s,%s)"   
    val = (float(data["coord"].get("lat")), float(data["coord"].get("lon")),int(data["dt"]), float(data["main"].get("temp")), float(data["main"].get("pressure")), float(data["wind"].get("speed")), float(data["main"].get("humidity")))
    mycursor.execute(sql, val)
    mydb.commit()
    mycursor.close()

def updateWeather(position, APIKEY, mydb):
    for i in position:
        lat = i[0]
        lon = i[1]
        try:
            r = requests.get("http://api.openweathermap.org/data/2.5/weather?lat={}&lon={}&appid={}".format(lat,lon,APIKEY))
        except:
            print(traceback.format_exc())
        w = json.loads(r.text)
        print("data fetched")
        addWeatherData(mydb, w)
        
#     host = "admin.cahp3chr8rr0.eu-west-1.rds.amazonaws.com"
# user = "admin"
# passwd = "admin123"
# host = "admin.cahp3chr8rr0.eu-west-1.rds.amazonaws.com"
# user = "admin"
# passwd = "zxcvbnm,"
def run_weather_getter():
    host = "dublinbikes.cuqw5bduct4h.eu-west-1.rds.amazonaws.com"
    user = "admin"
    passwd = "admin123"
    database = "DublinBikesDB"
    APIKEY = 'c9d5929c3180f174f633828540c0fbc5'
    mydb = Connect_DB(host,user,passwd,database)
    position = extract_loc_info(mydb,'DublinBikesData', "position_lat", "position_lng")
    
    while True:
        try:
            updateWeather(position,APIKEY,mydb)
        except:
            print("failed")
        time.sleep(60*60)
run_weather_getter()
