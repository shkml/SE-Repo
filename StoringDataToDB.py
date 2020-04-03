import requests
import json
import traceback
import time
import mysql.connector

APIKEY = 'af37588ddccd6b0760b7d0b5b8d77d5004d4917c'
NAME = 'Dublin' #contract name
STATIONS_URI = "https://api.jcdecaux.com/vls/v1/stations"

#To create the Database 'DublinBikesDB'
#mycursor.execute("CREATE DATABASE DublinBikesDB")

#Connection to Data base
mydb = mysql.connector.connect(
  host="dublinbikes.cuqw5bduct4h.eu-west-1.rds.amazonaws.com",
  user="admin",
  passwd="admin123",
  database="DublinBikesDB"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE TABLE IF NOT EXISTS DublinBikesData (address text, available_bike_stands integer, available_bikes integer, banking integer, bike_stands integer, bonus integer, contract_name text, last_update integer, name text, number integer, position_lat real, position_lng real, status text)")

# Method to save dublin bikes API data to the database
def addAPIResponseToDatabase(BikesData):
    for i in range(0, len(BikesData)):  # Iterating over each element in the json related to stations
        data = BikesData[i]

        # Add each of these elements to the table in our database
        sql = "INSERT INTO DublinBikesData (address, available_bike_stands, available_bikes, banking, bike_stands, bonus, contract_name , last_update, name, number , position_lat, position_lng, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

        val = (data.get("address"), int(data.get("available_bike_stands")), int(data.get("available_bikes")),
               int(data.get("banking")), int(data.get("bike_stands")), int(data.get("bonus")),
               data.get("contract_name"), float(data.get("last_update")), data.get("name"), int(data.get("number")),
               data.get("position").get("lat"), data.get("position").get("lng"), data.get("status"))

        mycursor.execute(sql, val)
    mydb.commit()

def addDataToDatabase():
    # run forever...
    while True:
        try:
            r = requests.get(STATIONS_URI, params={"apiKey": APIKEY, "contract": NAME})
            addAPIResponseToDatabase(json.loads(r.text))

            # now sleep for 5 minutes
            time.sleep(5 * 60)

        except:
            # if there is any problem, print the traceback
            print(traceback.format_exc())
    #return
addDataToDatabase()