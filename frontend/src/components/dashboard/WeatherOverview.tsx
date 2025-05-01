import React from 'react';
import { WeatherData } from '../../types';
import { getFishingScoreColor } from '../../utils/helpers';

interface WeatherOverviewProps {
  weather: WeatherData;
  fishingScore: number;
}

const WeatherOverview: React.FC<WeatherOverviewProps> = ({ weather, fishingScore }) => {
  return (
    <div className="weather-overview-component">
      <div className="weather-main">
        <div className="weather-temp">{Math.round(weather.temperature)}°F</div>
        <div className="weather-condition">{weather.conditions}</div>
      </div>
      
      <div className="weather-details">
        <div className="weather-detail-item">
          <span className="label">Wind:</span>
          <span className="value">{weather.windSpeed} mph {weather.windDirection}</span>
        </div>
        <div className="weather-detail-item">
          <span className="label">Pressure:</span>
          <span className="value">{weather.pressure} hPa</span>
        </div>
        <div className="weather-detail-item">
          <span className="label">Humidity:</span>
          <span className="value">{weather.humidity}%</span>
        </div>
        <div className="weather-detail-item">
          <span className="label">Precip:</span>
          <span className="value">{weather.precipitation} mm</span>
        </div>
      </div>
      
      <div className="fishing-score-container">
        <div 
          className="fishing-score" 
          style={{ color: getFishingScoreColor(fishingScore) }}
        >
          <span className="score-value">{fishingScore}</span>
          <span className="score-label">/100</span>
        </div>
        <div className="score-description">
          {fishingScore >= 80 && 'Excellent fishing conditions!'}
          {fishingScore >= 60 && fishingScore < 80 && 'Good fishing conditions.'}
          {fishingScore >= 40 && fishingScore < 60 && 'Average fishing conditions.'}
          {fishingScore >= 20 && fishingScore < 40 && 'Below average fishing conditions.'}
          {fishingScore < 20 && 'Poor fishing conditions.'}
        </div>
      </div>
    </div>
  );
};

export default WeatherOverview;