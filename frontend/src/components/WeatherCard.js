import React from 'react';

const WeatherCard = ({ data, timezone, getWeatherIcon, getWeatherDescription, unit }) => {
  if (!data) return null;

  const temp = Math.round(data.temperature_2m);
  const feelsLike = Math.round(data.apparent_temperature);
  const windSpeed = Math.round(data.wind_speed_10m);
  const humidity = data.relative_humidity_2m;
  const pressure = Math.round(data.pressure_msl);
  const precipitation = data.precipitation || 0;
  const cloudCover = data.cloud_cover;
  const uvIndex = data.uv_index ? Math.round(data.uv_index * 10) / 10 : 'N/A';

  return (
    <div className="weather-card">
      <div className="current-temp">
        <div className="temp-info">
          <div className="temp-icon">{getWeatherIcon(data.weather_code)}</div>
          <div className="temp-values">
            <div className="current-temperature">{temp}°</div>
            <div className="weather-description">{getWeatherDescription(data.weather_code)}</div>
            <div className="feels-like">Feels like {feelsLike}°</div>
          </div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <div className="detail-label">💨 Wind Speed</div>
          <div className="detail-value">{windSpeed} km/h</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">💧 Humidity</div>
          <div className="detail-value">{humidity}%</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">🌫️ Pressure</div>
          <div className="detail-value">{pressure} mb</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">☁️ Cloud Cover</div>
          <div className="detail-value">{cloudCover}%</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">🌧️ Precipitation</div>
          <div className="detail-value">{precipitation.toFixed(2)} mm</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">☀️ UV Index</div>
          <div className="detail-value">{uvIndex}</div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        color: 'var(--text-secondary)', 
        fontSize: '12px',
        marginTop: '15px'
      }}>
        Timezone: {timezone}
      </div>
    </div>
  );
};

export default WeatherCard;
