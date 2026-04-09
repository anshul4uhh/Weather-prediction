import React from 'react';

const ForecastCard = ({ 
  date, 
  maxTemp, 
  minTemp, 
  precipitation, 
  code, 
  windSpeed, 
  getWeatherIcon, 
  getWeatherDescription,
  unit 
}) => {
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="forecast-card">
      <div className="forecast-date">{formatDate(date)}</div>
      <div className="forecast-icon">{getWeatherIcon(code)}</div>
      <div className="forecast-temps">
        <span className="max-temp">{Math.round(maxTemp)}°</span>
        <span className="min-temp">{Math.round(minTemp)}°</span>
      </div>
      <div className="forecast-condition">{getWeatherDescription(code)}</div>
      <div className="forecast-details">
        <div>💧 {precipitation.toFixed(1)} mm</div>
        <div>💨 {Math.round(windSpeed)} km/h</div>
      </div>
    </div>
  );
};

export default ForecastCard;
