#!/usr/bin/env python3

from time import sleep
from urllib import request, parse
import json
import os

weatherApiUrl = "https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,daily&units=metric&" + os.environ.get("WEATHER_LAT_LONG") + "&appid=" + os.environ.get("WEATHER_API_KEY")
influxUrl = "http://localhost:8086/write?db=fridgeDB"

def upsertData(data):
    #print(data)
    req = request.Request(influxUrl, data=data.encode('utf-8'))
    response = request.urlopen(req)

def getDataPoint(data):
    return " temperature=" + str(data["temp"]) + ",icon=\"" + data["weather"][0]["icon"] + "\"" + ",description=\"" + data["weather"][0]["description"] + "\"" + ",main=\"" + data["weather"][0]["main"] + "\""

with request.urlopen(weatherApiUrl) as url:
    data = json.loads(url.read().decode())
    upsertData("currentTemp " + getDataPoint(data["current"]))
    upsertData("sixHourForecast " + getDataPoint(data["hourly"][6]))
    upsertData("twelveHourForecast " + getDataPoint(data["hourly"][12]))
    upsertData("eighteenHourForecast " + getDataPoint(data["hourly"][18]))