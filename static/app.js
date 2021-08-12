const beerFridgeMethods = {
    initEventHandlers: function() {
        $('#setTemp').on('change', function() { beerFridgeMethods.updateSetTemp($(this).val()); });
    },
    updateSetTemp: function(val) {
        $('#setTempValue').text(val);
    },
    updateForecast: function() {
        $.getJSON( weatherApiUrl, function( data ) { // TODO: Read last value from influx instead of the weather api
            $( "#currentTemp" ).text( data.current.temp );

            var currentWeatherIconUrl = 'http://openweathermap.org/img/wn/' + data.current.weather[0].icon + '@2x.png';
            $('#currentWeatherIcon').attr("src",currentWeatherIconUrl).show();
          });
    }
}

$(function() {
    beerFridgeMethods.updateForecast();
    beerFridgeMethods.initEventHandlers();
});