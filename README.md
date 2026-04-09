# Weather Forecast Pro 🌤️

A professional weather prediction website built with React, Node.js, and the Open-Meteo API.

## Features

✨ **Modern, Professional UI** - Similar to premium weather apps
- Real-time weather data
- Current temperature, humidity, wind speed, pressure
- 10-day weather forecast
- 24-hour hourly forecast
- UV index, cloud cover, precipitation data

🌍 **Flexible Location Input**
- Search for any city or location
- Automatic device geolocation
- Manual location entry

📡 **Reliable APIs**
- **Open-Meteo**: Free, accurate weather forecasts (no API key required)
- **Nominatim (OpenStreetMap)**: Free location-to-coordinates conversion

📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Beautiful gradient backgrounds

## Project Structure

```
weather_prediction/
├── backend/                 # Node.js/Express server
│   ├── server.js           # Main backend server
│   ├── package.json
│   └── .env
├── frontend/               # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   ├── App.css         # Styling
│   │   ├── index.js
│   │   └── components/
│   │       ├── WeatherCard.js       # Current weather display
│   │       ├── ForecastCard.js      # Daily forecast card
│   │       ├── HourlyForecast.js    # Hourly forecast
│   │       └── LocationSearch.js    # Search component
│   └── package.json
└── package.json            # Root package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Backend

Create/update `backend/.env`:
```
PORT=5000
NODE_ENV=development
```

### Step 3: Run the Application

**Option 1: Run both servers simultaneously (requires concurrently)**
```bash
npm install concurrently --save-dev
npm run dev
```

**Option 2: Run separately (recommended for development)**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

### Backend Server (http://localhost:5000)

#### 1. Get Weather by Location Name
```
POST /api/weather/by-location
Content-Type: application/json

{
  "location": "London"
}
```

Response:
```json
{
  "location": {
    "latitude": 51.5085,
    "longitude": -0.1257,
    "name": "London",
    "address": "..."
  },
  "weather": {
    "current": { ... },
    "hourly": { ... },
    "daily": { ... },
    "timezone": "Europe/London"
  }
}
```

#### 2. Get Weather by Coordinates
```
POST /api/weather/by-coordinates
Content-Type: application/json

{
  "latitude": 51.5085,
  "longitude": -0.1257
}
```

#### 3. Reverse Geocode (Get Location Name from Coordinates)
```
POST /api/geocode/reverse
Content-Type: application/json

{
  "latitude": 51.5085,
  "longitude": -0.1257
}
```

## Frontend Features

### Location Search
Users can:
- Type any city/location name and search
- Use "Current Location" button for device geolocation
- See location details and weather instantly

### Weather Display
- **Current Weather**: Temperature, weather condition, feels-like temp
- **Detailed Metrics**: Humidity, wind speed, pressure, cloud cover, precipitation, UV index
- **Hourly Forecast**: Next 24 hours with temperature and precipitation probability
- **10-Day Forecast**: Daily high/low temps, conditions, precipitation, wind speed

### User Experience
- Loading states with spinner animation
- Error handling with helpful messages
- Responsive grid layout that adapts to screen size
- Smooth transitions and hover effects
- Professional color scheme with gradient backgrounds

## Technologies Used

### Backend
- **Express.js** - Web framework
- **Node.js** - JavaScript runtime
- **Axios** - HTTP client for API calls
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Modern styling with gradients and animations
- **Geolocation API** - Browser geolocation support

### External APIs
- **Open-Meteo API** - Free weather forecasts
- **Nominatim (OSM)** - Free geocoding/reverse geocoding

## How It Works

1. **User Input**: User enters location or allows browser geolocation
2. **Location Processing**: 
   - If location name: Backend converts to coordinates via Nominatim
   - If geolocation: Browser provides coordinates directly
3. **Weather Fetch**: Backend calls Open-Meteo API with coordinates
4. **Display**: React components render weather data with professional UI

## Weather Data Details

### Current Weather
- Temperature
- Apparent/Feels-like temperature
- Weather condition (clear, cloudy, rainy, snowy, etc.)
- Wind speed and direction
- Relative humidity
- Atmospheric pressure
- Cloud cover percentage
- Precipitation amount
- UV index

### Forecast Data
- Daily: High/low temps, precipitation, wind speed, weather code
- Hourly: Temperature, weather code, cloud cover, precipitation probability, humidity

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight, no heavy dependencies
- Responsive design with CSS Grid and Flexbox
- Efficient API calls with caching-friendly headers
- Smooth animations using CSS transitions

## Customization

### Change Color Scheme
Edit CSS variables in `frontend/src/App.css`:
```css
:root {
  --primary-color: #0066cc;
  --secondary-color: #4da6ff;
  --dark-bg: #0a1628;
  /* ... more variables ... */
}
```

### Change Default Location
Modify `frontend/src/App.js` `handleGetDeviceLocation()` to use a default location.

### Add More Details
Extend the Open-Meteo API parameters in `backend/server.js` to fetch additional data.

## Troubleshooting

### "Location not found" error
- Ensure the location name is spelled correctly
- Try a more specific location (e.g., "New York, USA")
- The Nominatim API requires a User-Agent header (already configured)

### CORS errors
- Ensure backend is running on port 5000
- Check that `proxy` is set correctly in `frontend/package.json`

### Weather data not loading
- Verify internet connection
- Check if Open-Meteo API is accessible: https://api.open-meteo.com/v1/forecast
- Check browser console for detailed error messages

### Geolocation not working
- Ensure browser has permission to access location
- Check browser console for geolocation errors
- Some browsers require HTTPS for geolocation (localhost works in dev)

## Future Enhancements

- [ ] Search suggestions/autocomplete
- [ ] Weather alerts and warnings
- [ ] Save favorite locations
- [ ] Air quality index (AQI)
- [ ] Weather history/past data
- [ ] Multiple language support
- [ ] Dark/Light theme toggle
- [ ] Weather maps with radar
- [ ] Rainfall probability graph
- [ ] Share weather with others

## License

This project is open source and available under the MIT License.

## Credits

- Weather data: [Open-Meteo](https://open-meteo.com/)
- Location data: [OpenStreetMap Nominatim](https://nominatim.org/)
- Icons: Unicode emojis

## Support

For issues, suggestions, or contributions, please open an issue or contact the development team.

---

**Happy Weather Forecasting! 🌦️** ☀️ ⛅ 🌧️ ❄️
