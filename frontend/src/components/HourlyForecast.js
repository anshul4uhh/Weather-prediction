import React from 'react';

const HourlyForecast = ({ hourly, timezone, getWeatherIcon, unit }) => {
  if (!hourly || !hourly.time) return null;

  const now = new Date();
  const currentHourIndex = now.getHours();

  // Get next 24 hours of data
  const nextHours = hourly.time
    .slice(currentHourIndex, currentHourIndex + 24)
    .map((time, idx) => {
      const actualIdx = currentHourIndex + idx;
      return {
        time,
        temp: hourly.temperature_2m[actualIdx],
        code: hourly.weather_code[actualIdx],
        cloudCover: hourly.cloud_cover[actualIdx],
        humidity: hourly.relative_humidity_2m[actualIdx],
        precipProb: hourly.precipitation_probability[actualIdx] || 0
      };
    });

  const formatHour = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="hourly-section">
      <h3>⏰ Hourly Forecast (Next 24 Hours)</h3>
      <div className="hourly-scroll">
        {nextHours.map((hour, idx) => (
          <div key={idx} className="hourly-item">
            <div className="hourly-time">{formatHour(hour.time)}</div>
            <div className="hourly-icon">{getWeatherIcon(hour.code)}</div>
            <div className="hourly-temp">{Math.round(hour.temp)}°</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              💧 {hour.precipProb}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;
