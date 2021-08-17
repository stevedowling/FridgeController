const beerFridgeMethods = {
    influxBaseUrl: "http://10.1.1.227:8086",
    influxDatabasseName: "fridgeDB",
    influxReadMethod: function() { return `${influxBaseUrl}/read?db=${influxDatabasseName}` },
    influxWrite: function(measurement, field, value, callback) {
        fetch(`${this.influxBaseUrl}/write?db=${beerFridgeMethods.influxDatabasseName}`, {
                method: "POST",
                headers: {'Content-Type': 'application/text'},
                body: `${measurement} ${field}=${value}`
            })
            .then(callback)
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
            beerFridgeMethods.influxWrite('SetTemp', 'Temperature', newTemp, () => {                
                beerFridgeMethods.influxReadLast('SetTemp','Temperature', function(data) { 
                    beerFridgeMethods.updateDisplayedSetTemp(data.results[0].series[0].values[0]) 
                })
            })
        })
    },
    updateDisplayedSetTemp(fields) {
        var lastUpdated = new Date(fields[0])
        var newTemp = fields[1]
        document.getElementById('setTemp').value = newTemp
        var setTempValueElement = document.getElementById('setTempValue')
        setTempValueElement.textContent = newTemp    
        setTempValueElement.title = "Last updated: " + lastUpdated.toLocaleString('en-AU') 
    },
    updateForecast: function() {
        // TODO: Refresh this periodically
        beerFridgeMethods.influxReadLast('currentTemp', 'temperature,icon,description', function(data) {
            var fields = data.results[0].series[0].values[0]
            document.getElementById('currentTemp').textContent = fields[1].toFixed(1)

            var lastUpdated = new Date(fields[0])
            var currentWeatherIconUrl = `http://openweathermap.org/img/wn/${fields[2]}@2x.png`
            var currentWeatherIcon = document.getElementById('currentWeatherIcon')
            currentWeatherIcon.setAttribute('src', currentWeatherIconUrl)
            currentWeatherIcon.style.display = "inline-block"
            currentWeatherIcon.title = fields[3] + '\n' + lastUpdated.toLocaleString('en-AU')
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    beerFridgeMethods.updateForecast()
    beerFridgeMethods.initEventHandlers()
    beerFridgeMethods.influxReadLast('SetTemp','Temperature', function(data) { 
        beerFridgeMethods.updateDisplayedSetTemp(data.results[0].series[0].values[0]) 
    })
})