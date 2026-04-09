# Quick Start Guide 🚀

## Get Your Weather App Running in 5 Minutes

### 1. Install Node Packages

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start the Application

**Option A: Run Everything at Once**
```bash
npm run dev
```
This runs both backend and frontend simultaneously.

**Option B: Run Separately (Recommended for Development)**

Terminal 1 - Start Backend:
```bash
cd backend
npm start
```
You should see: `Weather API server running on port 5000`

Terminal 2 - Start Frontend:
```bash
cd frontend
npm start
```
The app will open at `http://localhost:3000`

### 3. Use the App

1. **Allow Location Access**: When prompted, allow the browser to access your location
2. **Automatic Weather**: Current location weather appears instantly
3. **Search**: Use the search bar to find weather for any city
4. **View Forecast**: See current conditions, hourly, and 10-day forecasts

## Key Features to Try

✅ **Current Weather Card** - Shows temperature, conditions, wind, humidity, pressure, UV index
✅ **Hourly Forecast** - Scroll through next 24 hours
✅ **10-Day Forecast** - Plan ahead with daily forecasts
✅ **Location Search** - Search any city in the world
✅ **Auto Location** - Click "Current Location" button anytime

## Ports

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Stop the App

Press `Ctrl+C` in the terminal(s)

## Troubleshooting

**Backend won't start?**
- Make sure port 5000 is not in use
- Check that Node.js is installed: `node --version`

**Frontend won't start?**
- Make sure port 3000 is not in use
- Delete `node_modules` and `package-lock.json`, then `npm install` again

**Location not working?**
- Check browser console for permission errors
- Ensure HTTPS or localhost (geolocation requires secure context)

**Weather data not showing?**
- Check internet connection
- Check browser console for error messages
- Verify backend is running on port 5000

## Project Files Overview

```
weather_prediction/
├── backend/server.js          ← API endpoints, location conversion, weather fetching
├── frontend/src/App.js        ← Main React app, state management
├── frontend/src/App.css       ← Professional styling
├── frontend/src/components/   ← React components (Weather, Forecast, Hourly, Search)
└── README.md                  ← Full documentation
```

## What Each Component Does

| Component | Purpose |
|-----------|---------|
| `App.js` | Main app, handles location search, geolocation, API calls |
| `WeatherCard.js` | Shows current weather with all details |
| `HourlyForecast.js` | Scrollable hourly weather for next 24 hours |
| `ForecastCard.js` | Single day forecast card for 10-day view |
| `LocationSearch.js` | Search input and button |

## Backend Endpoints

```
POST /api/weather/by-location
  → Convert city name to coordinates, get weather

POST /api/weather/by-coordinates
  → Get weather for specific latitude/longitude

POST /api/geocode/reverse
  → Get location name from coordinates
```

## Next Steps

1. Explore the UI and try different cities
2. Read `README.md` for detailed documentation
3. Customize colors in `frontend/src/App.css`
4. Deploy to production (see deployment guides)

## Need Help?

- Check browser console for error messages (F12)
- Check terminal output for backend errors
- Read README.md for detailed documentation
- Verify all dependencies installed: `npm list`

---

**Enjoy your professional weather app!** 🌞🌧️❄️
