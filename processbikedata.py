import json
import requests
from  flask import request
import os
import time
def grapfdata():
    try:
        bd_json = open('static/BikesData.json')
    except IOError:
        print("file dublin.json not found")
    else:
        print('successfully open file dublin.json ')
    finally:
        gdata = json.load(bd_json)
        bd_json.close()
    # staname = request.args.get("selected_sta")
    stations = {}
    for i in gdata:
        if i["name"] not in stations:
            stations[i["name"]] = {}

    for m in stations:
        weekday_data = {
            "Mon": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Tue": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Wed": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Thu": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Fri": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Sat": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
            "Sun": {'ab': 0, 'abs': 0, 'ab_time_usage': {}, 'abs_time_usage': {}},
        }
        count = {}
        count_h = {}
        # print(count_h)
        for j in weekday_data.keys():
            count[j] = 0
            count_h[j] = {}
            for i in range(0, 24):
                weekday_data[j]['ab_time_usage'][str(i)] = 0
                weekday_data[j]['abs_time_usage'][str(i)] = 0
        for i in count_h:
            for j in range(0, 24):
                count_h[i][str(j)] = 0

        # print("m",m)
        for i in gdata:
            if i['name'] == m:
                for j in weekday_data.keys():
                    if j in i['DayOfWeek']:
                        weekday_data[j]['ab'] += i['available_bikes'] #sum the available bikes to get average data
                        weekday_data[j]['abs'] += i['available_bike_stands']
                        count[j] += 1

                        t = str((time.localtime(i['last_update']/1000)).tm_hour)
                        weekday_data[j]['ab_time_usage'][t] += i['available_bikes']
                        weekday_data[j]['abs_time_usage'][t] += i['available_bike_stands']
                        count_h[j][t] += 1
        # print(weekday_data)
        for k in weekday_data.keys():
            weekday_data[k]['ab'] = round(weekday_data[k]['ab']/count[k])
            weekday_data[k]['abs'] = round(weekday_data[k]['abs']/count[k])
            for hour in weekday_data[k]['ab_time_usage']:
                weekday_data[k]['ab_time_usage'][hour] = round(weekday_data[k]['ab_time_usage'][hour]/count_h[k][hour])
            for hour in weekday_data[k]['abs_time_usage']:
                weekday_data[k]['abs_time_usage'][hour] = round(weekday_data[k]['abs_time_usage'][hour]/count_h[k][hour])
            # print(weekday_data)
        stations[m] = weekday_data
    for i in stations:
        print(stations[i])
    print(len(stations))
    f = open("./static/processedBikeData.json", 'w')
    json.dump(stations, f)
    f.close()


    #
    # print(weekday_data)

grapfdata()