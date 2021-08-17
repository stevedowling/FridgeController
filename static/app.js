const beerFridgeMethods = {
    influxBaseUrl: "http://10.1.1.227:8086",
    influxDatabasseName: "fridgeDB",
    influxReadMethod: function() { return `${influxBaseUrl}/read?db=${influxDatabasseName}` },
    influxWrite: function(measurement, field, value) {
        fetch(`${this.influxBaseUrl}/write?db=${beerFridgeMethods.influxDatabasseName}`, {
                method: "POST",
                headers: {'Content-Type': 'application/text'},
                body: `${measurement} ${field}=${value}`
            })
            .catch(console.error) // TODO: Better error handling
    },
    influxReadLast: function(measurement, fields, callback) {
        fetch(`${this.influxBaseUrl}/query?db=${beerFridgeMethods.influxDatabasseName}&q=SELECT ${fields} FROM ${measurement} ORDER BY time DESC LIMIT 1`)
            .then(response => response.json())
            .then(data => {
                callback(data)
            })
            .catch(console.error) // TODO: Better error handling
    },
    initEventHandlers: function() {
        document.getElementById('setTemp').addEventListener('change', event => {
            var newTemp = event.target.value
            document.getElementById('setTempValue').textContent = newTemp
            beerFridgeMethods.influxWrite('SetTemp', 'Temperature', newTemp)
        })
    },
    updateSetTemp: function(newTemp) {
        document.getElementById('setTempValue').textContent = newTemp
        beerFridgeMethods.influxWrite('SetTemp', 'Temperature', newTemp)
    },
    updateDisplayedSetTemp(newTemp) {
        document.getElementById('setTemp').value = newTemp
        document.getElementById('setTempValue').textContent = newTemp        
    },
    updateForecast: function() {
        beerFridgeMethods.influxReadLast('currentTemp', 'temperature,icon,description', function(data) {
            var fields = data.results[0].series[0].values[0]
            document.getElementById('currentTemp').textContent = fields[1].toFixed(1)

            var currentWeatherIconUrl = `http://openweathermap.org/img/wn/${fields[2]}@2x.png`
            var currentWeatherIcon = document.getElementById('currentWeatherIcon')
            currentWeatherIcon.setAttribute('src', currentWeatherIconUrl)
            currentWeatherIcon.style.display = "inline-block"
            currentWeatherIcon.title = fields[3]
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    beerFridgeMethods.updateForecast()
    beerFridgeMethods.initEventHandlers()
    beerFridgeMethods.influxReadLast('SetTemp','Temperature', function(data) { beerFridgeMethods.updateDisplayedSetTemp(data.results[0].series[0].values[0][1]) })
})