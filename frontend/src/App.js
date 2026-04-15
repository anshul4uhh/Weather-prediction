import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import LocationSearch from './components/LocationSearch';

const API_URL = 'https://weather-prediction-xrn5.onrender.com';

const NAV_LINKS = ['Home', 'Features', 'How It Works', 'Forecast', 'Contact'];

const FEATURES = [
  { icon: '🌡', title: 'Real-Time Temperature', desc: 'Get live temperature, feels-like, humidity, and pressure data updated every moment.' },
  { icon: '🌬', title: 'Wind & Visibility', desc: 'Track wind speed, direction, and UV index to plan your day confidently.' },
  { icon: '📅', title: '10-Day Forecast', desc: 'Plan ahead with a detailed 10-day outlook including high/low temps and conditions.' },
  { icon: '📍', title: 'GPS Location', desc: 'Auto-detect your current location with one tap for instant local weather.' },
  { icon: '🌐', title: 'Global Coverage', desc: 'Search any city worldwide and get accurate meteorological data in seconds.' },
  { icon: '🌈', title: 'Smart Suggestions', desc: 'Get location autocomplete suggestions as you type — like Google Maps.' },
];

const STEPS = [
  { num: '01', title: 'Enter Location', desc: 'Type any city name in the search bar or click "Use My Location" to auto-detect.' },
  { num: '02', title: 'Fetch Live Data', desc: 'We query Open-Meteo global API to pull accurate meteorological data.' },
  { num: '03', title: 'Analyze & Display', desc: 'Our system processes and visualizes current conditions plus the 10-day forecast.' },
  { num: '04', title: 'Plan Your Day', desc: 'Use the insights to make smart decisions—what to wear, whether to travel.' },
];

function getTheme(weatherCode) {
  if (!weatherCode) return { bg: '#0f1628', card: 'rgba(79,156,249,0.1)', accent: '#4f9cf9' };
  const code = parseInt(weatherCode);
  if (code === 0 || code === 1) return { bg: '#0a1628', card: 'rgba(79,156,249,0.1)', accent: '#fbbf24' };
  if (code >= 80) return { bg: '#0f172a', card: 'rgba(59,130,246,0.1)', accent: '#60a5fa' };
  if (code >= 70) return { bg: '#1a0a2e', card: 'rgba(167,139,250,0.1)', accent: '#a78bfa' };
  if (code >= 60) return { bg: '#0d1b35', card: 'rgba(147,197,253,0.1)', accent: '#bae6fd' };
  if (code >= 50) return { bg: '#1e1e2e', card: 'rgba(148,163,184,0.1)', accent: '#94a3b8' };
  return { bg: '#0f1628', card: 'rgba(255,255,255,0.07)', accent: '#4f9cf9' };
}

function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function App() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [active, setActive] = useState('Home');
  const [form, setForm] = useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const homeRef = useRef();
  const featRef = useRef();
  const howRef = useRef();
  const forecastRef = useRef();
  const contactRef = useRef();

  const theme = getTheme(weather?.weather?.current?.weather_code);

  // Auto-load device location on app start
  useEffect(() => {
    handleGPS();
  }, []);

  // Fetch weather from coordinates
  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const response = await axios.post(`${API_URL}/api/weather/by-coordinates`, {
        latitude: lat,
        longitude: lon,
      });
      setWeather(response.data);
      setLocation(response.data.location);
      setTimeout(() => forecastRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search by location name
  const handleLocationSearch = async (locationName) => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const response = await axios.post(`${API_URL}/api/weather/by-location`, {
        location: locationName,
      });
      setWeather(response.data);
      setLocation(response.data.location);
      setTimeout(() => forecastRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      setError('Location not found. Please try another search.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get device location
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false);
        setError('Location access denied. Please enable GPS.');
      }
    );
  };

  // Smooth scroll to sections
  const scrollTo = (section) => {
    const map = { Home: homeRef, Features: featRef, 'How It Works': howRef, Forecast: forecastRef, Contact: contactRef };
    map[section]?.current?.scrollIntoView({ behavior: 'smooth' });
    setActive(section);
    setMenuOpen(false);
  };

  // Handle contact form
  const handleContact = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', msg: '' });
  };

  // Wind direction
  const windDir = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const S = {
    page: { minHeight: '100vh', background: theme.bg, color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif", transition: 'background 1s ease' },
    nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 clamp(1rem,4vw,3rem)' },
    navInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
    logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
    logoIcon: { width: 38, height: 38, background: `linear-gradient(135deg, ${theme.accent}, #818cf8)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
    logoText: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: '#f1f5f9' },
    navLinks: { display: 'flex', gap: 8, alignItems: 'center' },
    navLink: (a) => ({ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', background: a ? `${theme.accent}22` : 'transparent', color: a ? theme.accent : '#94a3b8', border: a ? `1px solid ${theme.accent}44` : '1px solid transparent' }),
    hero: { maxWidth: 1200, margin: '0 auto', padding: 'clamp(3rem,8vw,6rem) clamp(1rem,4vw,3rem) 4rem', textAlign: 'center' },
    badge: { display: 'inline-block', padding: '5px 16px', borderRadius: 999, background: `${theme.accent}18`, border: `1px solid ${theme.accent}44`, color: theme.accent, fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.03em' },
    h1: { fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 20px', background: `linear-gradient(135deg, #f1f5f9 40%, ${theme.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.65 },
    section: { maxWidth: 1200, margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,3rem)' },
    sectionTag: { fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: theme.accent, textTransform: 'uppercase', marginBottom: 12 },
    sectionTitle: { fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: '#f1f5f9', marginBottom: 16 },
    sectionSub: { color: '#64748b', fontSize: 16, lineHeight: 1.65, maxWidth: 520, marginBottom: 48 },
    divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 },
    card: { background: theme.card, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', transition: 'all 0.3s', backdropFilter: 'blur(10px)' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 },
    weatherCard: { background: `linear-gradient(135deg, ${theme.card}, rgba(255,255,255,0.04))`, border: `1px solid ${theme.accent}33`, borderRadius: 28, padding: 'clamp(24px,4vw,40px)', marginBottom: 24 },
    tempBig: { fontSize: 'clamp(4rem,12vw,8rem)', fontWeight: 800, letterSpacing: '-4px', color: '#f1f5f9', lineHeight: 1, margin: '8px 0' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 24 },
    stat: { background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px', textAlign: 'center' },
    statLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
    statVal: { fontSize: 20, fontWeight: 700, color: '#f1f5f9' },
    forecastGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 },
    forecastCard: { background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '18px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px', color: '#f1f5f9', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px', color: '#f1f5f9', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14, resize: 'vertical', minHeight: 120 },
    submitBtn: { width: '100%', padding: '15px', background: theme.accent, color: '#0a1628', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' },
    errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '16px 20px', color: '#fca5a5', textAlign: 'center', marginBottom: 24, fontSize: 15 },
    loader: { textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 15 },
    hamburger: { display: 'none', flexDirection: 'column', gap: 5, cursor: 'pointer', padding: 8 },
    gpsBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', padding: '10px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer', color: '#94a3b8', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{overflow-x:hidden;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:#0a1628;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        input::placeholder{color:#475569;} textarea::placeholder{color:#475569;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.5s ease forwards;}
        .feat-card:hover{background:rgba(255,255,255,0.1)!important;transform:translateY(-3px);}
        .fday:hover{background:rgba(255,255,255,0.09)!important;transform:scale(1.03);}
        .gps-btn:hover{background:rgba(255,255,255,0.1)!important;color:#f1f5f9!important;}
        @media(max-width:700px){
          .nav-links{display:none!important;}
          .hamburger{display:flex!important;}
          .mobile-menu{display:flex;}
        }
        .mobile-menu{display:none;flex-direction:column;gap:6px;position:absolute;top:64px;left:0;right:0;background:rgba(10,15,30,0.97);padding:16px;border-bottom:1px solid rgba(255,255,255,0.08);z-index:99;}
      `}</style>

      <div style={S.page}>
        {/* NAVBAR */}
        <nav style={S.nav}>
          <div style={S.navInner}>
            <div style={S.logo} onClick={() => scrollTo('Home')}>
              <div style={S.logoIcon}>🌦</div>
              <span style={S.logoText}>WeatherPulse</span>
            </div>
            <div style={{ ...S.navLinks }} className="nav-links">
              {NAV_LINKS.map((l) => (
                <span key={l} style={S.navLink(active === l)} onClick={() => scrollTo(l)}>
                  {l}
                </span>
              ))}
            </div>
            <div className="hamburger" style={S.hamburger} onClick={() => setMenuOpen((p) => !p)}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 24, height: 2, background: '#94a3b8', borderRadius: 2 }} />
              ))}
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-menu">
              {NAV_LINKS.map((l) => (
                <span key={l} style={{ ...S.navLink(active === l), display: 'block' }} onClick={() => scrollTo(l)}>
                  {l}
                </span>
              ))}
            </div>
          )}
        </nav>

        {/* HERO */}
        <div ref={homeRef} style={S.hero} className="fade-up">
          <div style={S.badge}>✦ Live Weather Intelligence</div>
          <h1 style={S.h1}>
            Weather, Predicted
            <br />
            Precisely.
          </h1>
          <p style={S.subtitle}>Real-time forecasts, 10-day outlooks, and precise data — all in one beautifully designed experience.</p>

          <LocationSearch onSearch={handleLocationSearch} disabled={loading} />

          <button className="gps-btn" style={S.gpsBtn} onClick={handleGPS} disabled={loading}>
            <span>📍</span> Use My Current Location
          </button>
        </div>

        <hr style={S.divider} />

        {/* WEATHER RESULT */}
        <div ref={forecastRef} style={S.section}>
          {loading && (
            <div style={S.loader}>
              <div style={{ width: 40, height: 40, border: `3px solid ${theme.accent}33`, borderTopColor: theme.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Fetching weather data…
            </div>
          )}
          {error && <div style={S.errorBox}>⚠ {error}</div>}

          {weather && !loading && (
            <div className="fade-up">
              <div style={S.weatherCard}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>CURRENT WEATHER</div>
                    <div style={{ fontSize: 'clamp(1.4rem,4vw,2.2rem)', fontWeight: 800, color: '#f1f5f9' }}>
                      {location?.name || location?.address || 'Current Location'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={S.tempBig}>{Math.round(weather.weather?.current?.temperature_2m || 0)}°</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 28 }}>{getWeatherIcon(weather.weather?.current?.weather_code)}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', textTransform: 'capitalize' }}>
                          {weather.weather?.current?.is_day ? 'Daytime' : 'Nighttime'}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Feels like {Math.round(weather.weather?.current?.apparent_temperature || 0)}°C</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 80, lineHeight: 1 }}>{getWeatherIcon(weather.weather?.current?.weather_code)}</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                      H:{Math.round(weather.weather?.daily?.temperature_2m_max?.[0] || 0)}° / L:{Math.round(weather.weather?.daily?.temperature_2m_min?.[0] || 0)}°
                    </div>
                  </div>
                </div>

                <div style={S.statGrid}>
                  {[
                    { label: 'Humidity', val: `${weather.weather?.current?.relative_humidity_2m || 0}%`, icon: '💧' },
                    { label: 'Wind', val: `${Math.round(weather.weather?.current?.wind_speed_10m || 0)} m/s ${windDir(weather.weather?.current?.wind_direction_10m || 0)}`, icon: '🌬' },
                    { label: 'Pressure', val: `${Math.round(weather.weather?.current?.surface_pressure || 0)} hPa`, icon: '📊' },
                    { label: 'Cloud Cover', val: `${weather.weather?.current?.cloud_cover || 0}%`, icon: '☁️' },
                    { label: 'Precipitation', val: `${weather.weather?.current?.precipitation || 0} mm`, icon: '🌧' },
                    { label: 'UV Index', val: `${Math.round(weather.weather?.current?.uv_index || 0)}`, icon: '☀️' },
                  ].map((s) => (
                    <div key={s.label} style={S.stat}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={S.statLabel}>{s.label}</div>
                      <div style={S.statVal}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10-DAY FORECAST */}
              {weather.weather?.daily && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 4, height: 28, background: theme.accent, borderRadius: 2 }} />
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>10-Day Forecast</span>
                  </div>
                  <div style={S.forecastGrid}>
                    {weather.weather.daily.time.map((date, i) => {
                      const d = new Date(date);
                      return (
                        <div key={i} className="fday" style={{ ...S.forecastCard, borderColor: i === 0 ? `${theme.accent}55` : 'rgba(255,255,255,0.08)', background: i === 0 ? `${theme.accent}15` : 'rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? theme.accent : '#64748b', letterSpacing: '0.06em', marginBottom: 8 }}>
                            {i === 0 ? 'TODAY' : days[d.getDay()].toUpperCase()}
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', marginBottom: 10 }}>
                            {months[d.getMonth()]} {d.getDate()}
                          </div>
                          <div style={{ fontSize: 30, marginBottom: 10 }}>{getWeatherIcon(weather.weather.daily.weather_code[i])}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 500 }}>Forecast</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{Math.round(weather.weather.daily.temperature_2m_max[i])}°</div>
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{Math.round(weather.weather.daily.temperature_2m_min[i])}°</div>
                          <div style={{ marginTop: 8, height: 2, borderRadius: 2, background: `linear-gradient(90deg, #475569, ${theme.accent})`, opacity: 0.5 }} />
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>💧 {Math.round(weather.weather.daily.precipitation_sum[i])} mm</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {!weather && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 72, marginBottom: 20, opacity: 0.4 }}>🌍</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#334155', marginBottom: 10 }}>No location selected</div>
              <div style={{ color: '#475569', fontSize: 15 }}>Search for a city or use your current location to get started.</div>
            </div>
          )}
        </div>

        <hr style={S.divider} />

        {/* FEATURES */}
        <div ref={featRef} style={S.section}>
          <div style={S.sectionTag}>What We Offer</div>
          <h2 style={S.sectionTitle}>
            Powerful Features
            <br />
            Built for Everyone
          </h2>
          <p style={S.sectionSub}>From casual planners to outdoor enthusiasts — WeatherPulse gives you the data you need, elegantly presented.</p>
          <div style={S.grid3}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card" style={{ ...S.card }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <hr style={S.divider} />

        {/* HOW IT WORKS */}
        <div ref={howRef} style={S.section}>
          <div style={S.sectionTag}>The Process</div>
          <h2 style={S.sectionTitle}>How It Works</h2>
          <p style={S.sectionSub}>From your search to a full forecast — here's the journey your request takes in milliseconds.</p>
          <div style={S.grid4}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: `${theme.accent}18`, position: 'absolute', top: 12, right: 16, lineHeight: 1, letterSpacing: '-2px' }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: theme.accent, marginBottom: 14 }}>STEP {s.num}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <hr style={S.divider} />

        {/* ABOUT */}
        <div style={{ ...S.section, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={S.sectionTag}>About WeatherPulse</div>
            <h2 style={{ ...S.sectionTitle, marginBottom: 20 }}>
              Weather Intelligence,
              <br />
              Reimagined
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, marginBottom: 20 }}>
              WeatherPulse was built with one goal: make weather information not just accurate, but beautiful and intuitive. We connect to Open-Meteo's global API to deliver real-time data to millions of users worldwide.
            </p>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75 }}>
              Whether you're planning a hike, a wedding, or just deciding what to wear — WeatherPulse has you covered with data you can trust and a design that delights.
            </p>
            <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
              {[
                ['200+', 'Countries'],
                ['10M+', 'Users'],
                ['99.9%', 'Uptime'],
              ].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: theme.accent }}>{v}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['🌡', 'Accuracy', 'Powered by global sensor networks'],
              ['⚡', 'Speed', 'Data refreshed every 10 minutes'],
              ['🔒', 'Privacy', 'No account required, ever'],
              ['🎨', 'Design', 'Adaptive UI for every condition'],
            ].map(([icon, t, d]) => (
              <div key={t} style={{ ...S.card, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <hr style={S.divider} />

        {/* CONTACT */}
        <div ref={contactRef} style={S.section}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ ...S.sectionTag, textAlign: 'center' }}>Get In Touch</div>
            <h2 style={{ ...S.sectionTitle, textAlign: 'center' }}>Contact Us</h2>
            <p style={{ ...S.sectionSub, textAlign: 'center', margin: '0 auto 40px' }}>Have questions, feedback, or partnership ideas? We'd love to hear from you.</p>
            <div style={S.card}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Message Sent!</div>
                  <div style={{ color: '#64748b' }}>We'll get back to you within 24 hours.</div>
                </div>
              ) : (
                <form onSubmit={handleContact}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>
                    <input style={S.input} placeholder="Your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                    <input style={S.input} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <textarea style={S.textarea} placeholder="Your message…" value={form.msg} onChange={(e) => setForm((p) => ({ ...p, msg: e.target.value }))} required />
                  <button type="submit" style={S.submitBtn}>
                    Send Message ✦
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20 }}>
              {[
                ['📧', 'hello@weatherpulse.io'],
                ['🐦', '@WeatherPulseApp'],
                ['📍', 'Global, Worldwide'],
              ].map(([icon, val]) => (
                <div key={val} style={{ ...S.card, textAlign: 'center', padding: '18px 12px' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#334155', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ ...S.logoIcon, width: 28, height: 28, fontSize: 14 }}>🌦</div>
            <span style={{ fontWeight: 700, color: '#475569' }}>WeatherPulse</span>
          </div>
          <div>© 2026 WeatherPulse Weather Intelligence. Powered by Open-Meteo API.</div>
          <div style={{ marginTop: 6, color: '#1e293b' }}>Built with precision. Designed with care.</div>
        </footer>
      </div>
    </>
  );
}

export default App;
