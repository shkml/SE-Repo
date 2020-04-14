import mysql.connector
import pandas as pd
import datetime
import random

mydb = mysql.connector.connect(
  host="dublinbikes.cuqw5bduct4h.eu-west-1.rds.amazonaws.com",
  user="admin",
  passwd="AWSDublinbikes",
  database="DublinBikesDB"
)
BikesData = pd.read_sql_query("SELECT * FROM BikesData",mydb)
WeatherData = pd.read_sql_query("SELECT * FROM WeatherData",mydb)

BikesData = BikesData.drop_duplicates()
WeatherData = WeatherData.drop_duplicates()

#Convert the last_update(BikesData) in Data time format to make it human understandable
def ConvertTimeBikes(time):
    formatted_dateTime = datetime.datetime.fromtimestamp(int(time)/1000)  # using the local timezone
    return pd.to_datetime(formatted_dateTime.strftime("%Y-%m-%d %H:%M:%S"))  # 2018-04-07 20:48:08, YMMV
BikesData["last_update"] = BikesData["last_update"].apply(ConvertTimeBikes)

#Convert the last_update(WeatherData) in Data time format to make it human understandable
def ConvertTimeWeather(time):
    formatted_dateTime = datetime.datetime.fromtimestamp(time)  # using the local timezone
    return pd.to_datetime(formatted_dateTime.strftime("%Y-%m-%d %H:%M:%S"))  # 2018-04-07 20:48:08, YMMV
WeatherData["last_update"] = WeatherData["last_update"].apply(ConvertTimeWeather)

#To create the pattern Days wise, Let us add a column stating the day
BikesData["DayOfWeek"] = BikesData.last_update.dt.day_name()
WeatherData["DayOfWeek"] = WeatherData.last_update.dt.day_name()

# Rounding off the lat and long since in Bikes API same is getting fetched till 6 decimal places, whereas in weather API
# same is presnt till 2 decimal places
def roundOff(n):
    return round(n,2)

BikesData["position_lat"] = BikesData["position_lat"].apply(roundOff)
BikesData["position_lng"] = BikesData["position_lng"].apply(roundOff)

#Conversion of kelvin temperature to celsius
def tempConversionKtoC(a):
  return a - 273.15

WeatherData["temperature"] = WeatherData["temperature"].apply(tempConversionKtoC)

#Exporting weather and Bikes data to json.
WeatherData.to_json(r'WeatherData.json',orient='records')
BikesData.to_json(r'BikesData.json',orient='records')