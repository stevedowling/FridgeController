from flask import Flask, render_template
import os

app = Flask(__name__)

app.config.update(
    WEATHER_LAT_LONG=os.environ.get("WEATHER_LAT_LONG"),
    WEATHER_API_KEY=os.environ.get("WEATHER_API_KEY")
)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
