/*function Weather() {
  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const API_KEY = '0e6c0db766615dd7ed89690b199e5fea'; // ← paste your key here
  const CITY = 'Dhaka';

  React.useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`)
      .then(r => r.json())
      .then(data => {
        if (data.cod !== 200) throw new Error(data.message);
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load weather.');
        setLoading(false);
      });
  }, []);

  const getWeatherIcon = (main) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Haze: '🌫️',
      Fog: '🌫️',
    };
    return icons[main] || '🌡️';
  };

  if (loading) return <div className="weather-card">Loading weather...</div>;
  if (error) return <div className="weather-card">{error}</div>;

  return (
    <div className="weather-card">
      <div className="weather-top">
        <div className="weather-icon">{getWeatherIcon(weather.weather[0].main)}</div>
        <div className="weather-info">
          <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
          <div className="weather-desc">{weather.weather[0].description}</div>
          <div className="weather-city">📍 {weather.name}, Bangladesh</div>
        </div>
      </div>
      <div className="weather-details">
        <div className="weather-detail-item">
          <span>💧</span>
          <span>Humidity: {weather.main.humidity}%</span>
        </div>
        <div className="weather-detail-item">
          <span>🌬️</span>
          <span>Wind: {weather.wind.speed} m/s</span>
        </div>
        <div className="weather-detail-item">
          <span>🌡️</span>
          <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
        </div>
        <div className="weather-detail-item">
          <span>👁️</span>
          <span>Visibility: {(weather.visibility / 1000).toFixed(1)} km</span>
        </div>
      </div>
    </div>
  );
}*/

function Weather() {
  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const API_KEY = '0e6c0db766615dd7ed89690b199e5fea';
  const CITY = 'Dhaka';

  React.useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`)
      .then(r => r.json())
      .then(data => {
        if (data.cod !== 200) throw new Error(data.message);
        setWeather(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load weather.');
        setLoading(false);
      });
  }, []);

  const getWeatherIcon = (main) => {
    const icons = {
      Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
      Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Haze: '🌫️', Fog: '🌫️',
    };
    return icons[main] || '🌡️';
  };

  // ── Delay recommendation logic ──
  const getDelayRecommendation = (data) => {
    const main = data.weather[0].main;
    const windSpeed = data.wind.speed;       // m/s
    const visibility = data.visibility;      // metres
    const rain = data.rain?.['1h'] || 0;    // mm in last hour

    if (main === 'Thunderstorm') {
      return {
        level: 'high',
        emoji: '🔴',
        title: 'High Delay Risk',
        message: 'Thunderstorm detected. Expect significant bus delays or cancellations. Plan ahead.'
      };
    }
    if (main === 'Rain' && rain > 10) {
      return {
        level: 'high',
        emoji: '🔴',
        title: 'High Delay Risk',
        message: 'Heavy rainfall. Roads may be flooded. Buses likely to be delayed significantly.'
      };
    }
    if (main === 'Rain' || main === 'Drizzle' || windSpeed > 10 || visibility < 2000) {
      return {
        level: 'medium',
        emoji: '🟡',
        title: 'Moderate Delay Risk',
        message: 'Rain or low visibility detected. Buses may run 10-20 minutes late. Leave early.'
      };
    }
    if (main === 'Mist' || main === 'Fog' || main === 'Haze') {
      return {
        level: 'medium',
        emoji: '🟡',
        title: 'Moderate Delay Risk',
        message: 'Low visibility conditions. Drivers will go slower. Expect minor delays.'
      };
    }
    if (main === 'Clouds' && windSpeed > 7) {
      return {
        level: 'low',
        emoji: '🟢',
        title: 'Low Delay Risk',
        message: 'Slightly windy but manageable. Buses should run close to schedule.'
      };
    }
    return {
      level: 'none',
      emoji: '🟢',
      title: 'No Delay Expected',
      message: 'Weather looks clear! Buses should run on time today.'
    };
  };

  const levelColors = {
    high:   { bg: '#fff0f0', border: '#ff4d4d', text: '#cc0000' },
    medium: { bg: '#fffbea', border: '#f5c842', text: '#b8860b' },
    low:    { bg: '#f0fff4', border: '#48bb78', text: '#276749' },
    none:   { bg: '#f0fff4', border: '#48bb78', text: '#276749' },
  };

  if (loading) return <div className="weather-card">Loading weather...</div>;
  if (error) return <div className="weather-card">{error}</div>;

  const recommendation = getDelayRecommendation(weather);
  const colors = levelColors[recommendation.level];

  return (
    <div>
      <div className="weather-card">
        <div className="weather-top">
          <div className="weather-icon">{getWeatherIcon(weather.weather[0].main)}</div>
          <div className="weather-info">
            <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
            <div className="weather-desc">{weather.weather[0].description}</div>
            <div className="weather-city">📍 {weather.name}, Bangladesh</div>
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail-item"><span>💧</span><span>Humidity: {weather.main.humidity}%</span></div>
          <div className="weather-detail-item"><span>🌬️</span><span>Wind: {weather.wind.speed} m/s</span></div>
          <div className="weather-detail-item"><span>🌡️</span><span>Feels like: {Math.round(weather.main.feels_like)}°C</span></div>
          <div className="weather-detail-item"><span>👁️</span><span>Visibility: {(weather.visibility / 1000).toFixed(1)} km</span></div>
        </div>
      </div>

      {/* Delay Recommendation Card */}
      <div className="delay-card" style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
      }}>
        <div className="delay-header">
          <span className="delay-emoji">{recommendation.emoji}</span>
          <span className="delay-title" style={{ color: colors.text }}>
            {recommendation.title}
          </span>
        </div>
        <p className="delay-message" style={{ color: colors.text }}>
          {recommendation.message}
        </p>
      </div>
    </div>
  );
}