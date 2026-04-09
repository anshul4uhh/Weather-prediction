# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  REACT FRONTEND (localhost:3000)                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  App.js                                             │  │  │
│  │  │  • State: weather, location, loading, error        │  │  │
│  │  │  • handleLocationSearch()                           │  │  │
│  │  │  • handleGetDeviceLocation()                        │  │  │
│  │  │  • fetchWeather()                                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────┬──────────────┬──────────────┬────────────┐  │  │
│  │  │WeatherCard│HourlyForecast│ForecastCard │LocationSearch│  │  │
│  │  └──────────┴──────────────┴──────────────┴────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  App.css (Professional Dark Theme)                 │  │  │
│  │  │  • Gradients, animations, responsive layout        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                    │
│                      HTTP/CORS Axios                            │
│                              ↓                                    │
└─────────────────────────────────────────────────────────────────┘
                               ↓
        ┌──────────────────────────────────────────┐
        │   EXPRESS.JS BACKEND (localhost:5000)     │
        │  ┌────────────────────────────────────┐  │
        │  │  server.js                         │  │
        │  │  ┌──────────────────────────────┐  │  │
        │  │  │POST /api/weather/by-location  │  │  │
        │  │  │  • Receives: location name    │  │  │
        │  │  │  • Calls Nominatim API        │  │  │
        │  │  │  • Calls Open-Meteo API       │  │  │
        │  │  │  • Returns: weather + coords  │  │  │
        │  │  └──────────────────────────────┘  │  │
        │  │  ┌──────────────────────────────┐  │  │
        │  │  │POST /api/weather/by-coordinates  │
        │  │  │  • Receives: lat, lon         │  │  │
        │  │  │  • Calls Open-Meteo API       │  │  │
        │  │  │  • Returns: weather data      │  │  │
        │  │  └──────────────────────────────┘  │  │
        │  │  ┌──────────────────────────────┐  │  │
        │  │  │POST /api/geocode/reverse      │  │  │
        │  │  │  • Receives: lat, lon         │  │  │
        │  │  │  • Calls Nominatim API        │  │  │
        │  │  │  • Returns: location name     │  │  │
        │  │  └──────────────────────────────┘  │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                        ↓              ↓
        ┌───────────────────┐  ┌──────────────────┐
        │  NOMINATIM API    │  │ OPEN-METEO API   │
        │ (OpenStreetMap)   │  │ (Weather data)   │
        │ • Geocoding       │  │ • Current weather│
        │ • Reverse         │  │ • Hourly forecast│
        │   Geocoding       │  │ • Daily forecast │
        │ • No API key      │  │ • NO API key     │
        │   required        │  │   required       │
        └───────────────────┘  └──────────────────┘
```

## Data Flow

### Scenario 1: User Searches for City

```
┌─────────────────┐
│ User types city │
│   "New York"    │
└────────┬────────┘
         │ User clicks Search
         ↓
    ┌─────────────────────────────────────────────┐
    │ LocationSearch.js                           │
    │ • Submits form with location name           │
    └─────────────────────────────────────────────┘
         │
         │ props.onSearch("New York")
         ↓
    ┌─────────────────────────────────────────────┐
    │ App.js                                      │
    │ handleLocationSearch("New York")            │
    │ • Sets loading = true                       │
    │ • axios.post("/api/weather/by-location")    │
    └─────────────────────────────────────────────┘
         │
         │ HTTP POST
         ↓
    ┌─────────────────────────────────────────────┐
    │ Backend server.js                           │
    │ POST /api/weather/by-location               │
    │ • getCoordinates("New York")                │
    └─────────────────────────────────────────────┘
         │
         │ axios.get(Nominatim API)
         ↓
    ┌─────────────────────────────────────────────┐
    │ Nominatim API returns:                      │
    │ { lat: 40.7128, lon: -74.0060, ... }       │
    └─────────────────────────────────────────────┘
         │
         │ getWeatherData(40.7128, -74.0060)
         ↓
    ┌─────────────────────────────────────────────┐
    │ axios.get(Open-Meteo API)                   │
    │ with latitude & longitude                   │
    └─────────────────────────────────────────────┘
         │
         │ Open-Meteo API returns: Weather data
         ↓
    ┌─────────────────────────────────────────────┐
    │ Backend returns combined response:          │
    │ {                                           │
    │   location: {...lat, lon...},               │
    │   weather: {...current, hourly, daily...}   │
    │ }                                           │
    └─────────────────────────────────────────────┘
         │
         │ HTTP response with JSON
         ↓
    ┌─────────────────────────────────────────────┐
    │ App.js                                      │
    │ setWeather(response.data)                   │
    │ setLocation(response.data.location)         │
    │ setLoading(false)                           │
    └─────────────────────────────────────────────┘
         │
         │ Re-render with state update
         ↓
    ┌─────────────────────────────────────────────┐
    │ React renders:                              │
    │ • WeatherCard (current weather)             │
    │ • HourlyForecast (24 hours)                 │
    │ • ForecastCard grid (10 days)               │
    └─────────────────────────────────────────────┘
         │
         │
         ↓
    ┌──────────────────────────────────────────┐
    │ USER SEES Beautiful weather data display:│
    │ • Current: 72°F, Sunny                   │
    │ • Hourly: Scrollable 24-hour forecast    │
    │ • 10-Day: Grid of daily forecasts        │
    └──────────────────────────────────────────┘
```

### Scenario 2: User Clicks "Current Location"

```
┌──────────────────────────────┐
│ User clicks "Current Location"│
└────────┬─────────────────────┘
         │
         ↓
    ┌──────────────────────────────────────────┐
    │ App.js                                   │
    │ handleGetDeviceLocation()                │
    │ • Sets loading = true                    │
    │ • Calls navigator.geolocation.           │
    │   getCurrentPosition()                   │
    └──────────────────────────────────────────┘
         │
         │ Browser asks permission
         ↓
    ┌──────────────────────────────────────────┐
    │ BROWSER GEOLOCATION API                  │
    │ Returns: { latitude: 40.7128,            │
    │           longitude: -74.0060 }          │
    └──────────────────────────────────────────┘
         │
         │ fetchWeather(40.7128, -74.0060)
         ↓
    ┌──────────────────────────────────────────┐
    │ Backend                                  │
    │ POST /api/weather/by-coordinates         │
    │ • getWeatherData(40.7128, -74.0060)      │
    └──────────────────────────────────────────┘
         │
         │ axios.get(Open-Meteo API)
         ↓
    ┌──────────────────────────────────────────┐
    │ Open-Meteo API returns weather data      │
    └──────────────────────────────────────────┘
         │
         │ Backend returns weather response
         ↓
    ┌──────────────────────────────────────────┐
    │ Frontend displays weather                │
    │ (same as Scenario 1 from here)           │
    └──────────────────────────────────────────┘
```

## Component Hierarchy

```
App.js (Root component)
├── header
│   ├── logo
│   └── .btn-location (click → handleGetDeviceLocation)
├── LocationSearch.js (form)
│   ├── input (controlled)
│   └── button (submit → handleLocationSearch)
├── error-message (conditional)
├── loading spinner (conditional)
└── weather-container (conditional - when weather data exists)
    ├── location-info
    │   ├── h2 (location name)
    │   └── p (address)
    ├── WeatherCard.js (current weather)
    │   ├── current-temp
    │   │   ├── temp-icon (emoji)
    │   │   └── temp-values
    │   │       ├── current-temperature
    │   │       ├── weather-description
    │   │       └── feels-like
    │   └── weather-details (grid)
    │       ├── detail-item (wind)
    │       ├── detail-item (humidity)
    │       ├── detail-item (pressure)
    │       ├── detail-item (cloud-cover)
    │       ├── detail-item (precipitation)
    │       └── detail-item (uv-index)
    ├── HourlyForecast.js
    │   └── hourly-scroll (flex, horizontal scroll)
    │       └── hourly-item × 24
    │           ├── hourly-time
    │           ├── hourly-icon (emoji)
    │           ├── hourly-temp
    │           └── precipProb
    ├── ForecastCard.js × 10 (inside forecast-grid)
    │   ├── forecast-date
    │   ├── forecast-icon (emoji)
    │   ├── forecast-temps
    │   │   ├── max-temp
    │   │   └── min-temp
    │   ├── forecast-condition
    │   └── forecast-details
    │       ├── precipitation
    │       └── wind-speed
    └── footer
        └── attribution & copyright
```

## State Management

```
App.js State:
├── weather: {
│   location: {
│     latitude, longitude, name, address
│   },
│   weather: {
│     current: {...},
│     hourly: {...},
│     daily: {...},
│     timezone: "..."
│   }
}
├── location: {
│   latitude, longitude, name, address
}
├── loading: boolean (true during API calls)
├── error: string or null (error message)
└── unit: "metric" (for future celsius/fahrenheit toggle)
```

## Event Flow

```
User Action → Event Handler → State Update → Component Re-render → UI Update
    ↓              ↓              ↓              ↓                ↓
Click     handleLocationSearch  setWeather,    React reruns      User sees
Search                         setLocation,    components        new weather
                              setLoading      (with new props)
```

## API Response Format

```javascript
// Backend returns this structure
{
  location: {
    latitude: number,
    longitude: number,
    name: string,
    address: string
  },
  weather: {
    current: {
      temperature_2m: number,
      apparent_temperature: number,
      relative_humidity_2m: number,
      weather_code: number,
      wind_speed_10m: number,
      wind_direction_10m: number,
      precipitation: number,
      pressure_msl: number,
      cloud_cover: number,
      uv_index: number
    },
    hourly: {
      time: string[],      // ISO 8601 timestamps
      temperature_2m: number[],
      weather_code: number[],
      // ... more arrays
    },
    daily: {
      time: string[],      // ISO 8601 dates
      temperature_2m_max: number[],
      temperature_2m_min: number[],
      weather_code: number[],
      precipitation_sum: number[],
      wind_speed_10m_max: number[],
      // ... more arrays
    },
    timezone: string
  }
}
```

---

This architecture ensures:
✅ **Clean Separation**: Frontend and Backend are independent
✅ **Scalability**: Easy to add new features
✅ **Performance**: Minimal rerenders, efficient APIs
✅ **Maintainability**: Clear component structure
✅ **Reliability**: Error handling at each step
