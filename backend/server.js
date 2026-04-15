const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with specific configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    /\.onrender\.com$/,  // Allow all Render URLs
    /^https?:\/\/.+\.vercel\.app$/,  // Allow Vercel deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Simple in-memory cache for suggestions (expires after 5 minutes)
const suggestionsCache = new Map();
const reverseGeocodeCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const GEO_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for geo cache

// Global rate limiter for Nominatim API (max 1 request per second)
let lastNominatimRequestTime = 0;
const NOMINATIM_MIN_INTERVAL = 1000; // 1 second minimum between requests

async function throttleNominatimRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequestTime;
  
  if (timeSinceLastRequest < NOMINATIM_MIN_INTERVAL) {
    const delayNeeded = NOMINATIM_MIN_INTERVAL - timeSinceLastRequest;
    console.log(`Throttling API request: waiting ${delayNeeded}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  
  lastNominatimRequestTime = Date.now();
}

function getCachedSuggestions(query) {
  const cached = suggestionsCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('Returning cached suggestions for:', query);
    return cached.data;
  }
  suggestionsCache.delete(query);
  return null;
}

function setCachedSuggestions(query, data) {
  suggestionsCache.set(query, {
    data: data,
    timestamp: Date.now()
  });
}

function getCachedReverseGeocode(lat, lon) {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = reverseGeocodeCache.get(key);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_EXPIRY) {
    console.log('Returning cached reverse geocode for:', key);
    return cached.data;
  }
  reverseGeocodeCache.delete(key);
  return null;
}

function setCachedReverseGeocode(lat, lon, data) {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  reverseGeocodeCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
}

// Helper function to get coordinates from location name using Nominatim (Open Street Map)
async function getCoordinates(locationName) {
  try {
    console.log('Geocoding location:', locationName);
    
    // Apply global throttle
    await throttleNominatimRequest();
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: locationName,
        format: 'json',
        limit: 1,
        countrycodes: 'in,us,gb,au,ca,de,fr'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 WeatherApp/1.0'
      },
      timeout: 15000
    });

    console.log('Nominatim response length:', response.data?.length);
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        name: location.name,
        address: location.display_name
      };
    }
    console.log('No location found for:', locationName);
    return null;
  } catch (error) {
    console.error('Geocoding error - Status:', error.response?.status, 'Message:', error.message);
    if (error.response?.status === 429) {
      console.error('429 Too Many Requests from Nominatim - Rate limited');
    }
    return null;
  }
}

// Helper function to reverse geocode (get location name from coordinates)
async function reverseGeocode(latitude, longitude, retries = 0) {
  try {
    // Check cache first
    const cached = getCachedReverseGeocode(latitude, longitude);
    if (cached) {
      return cached;
    }

    console.log('Reverse geocoding coordinates:', latitude, longitude);
    
    // Apply global throttle
    await throttleNominatimRequest();
    
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 WeatherApp/1.0'
      },
      timeout: 15000
    });

    console.log('Reverse geocoding response received');
    if (response.data && response.data.display_name) {
      const address = response.data.address || {};
      const locationName = address.city || 
                          address.town || 
                          address.village || 
                          address.county ||
                          address.state ||
                          response.data.display_name.split(',')[0];
      
      const result = {
        latitude: latitude,
        longitude: longitude,
        name: locationName,
        address: response.data.display_name
      };

      // Cache the result
      setCachedReverseGeocode(latitude, longitude, result);
      console.log('Extracted location name:', locationName);
      return result;
    }
    console.log('No location name found in reverse geocoding response');
    return null;
  } catch (error) {
    console.error('Reverse geocoding error - Status:', error.response?.status, 'Message:', error.message);
    
    // Retry once on 429 errors with exponential backoff
    if (error.response?.status === 429 && retries < 2) {
      const delayMs = 5000 + (retries * 5000); // 5s, then 10s
      console.log(`Retrying reverse geocoding (attempt ${retries + 2}) after ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return reverseGeocode(latitude, longitude, retries + 1);
    }
    
    return null;
  }
}
async function getWeatherData(latitude, longitude) {
  try {
    // Ensure coordinates are numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      console.error('Invalid coordinates:', latitude, longitude);
      return null;
    }

    const params = {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,uv_index',
      hourly: 'temperature_2m,weather_code,cloud_cover,precipitation_probability,relative_humidity_2m,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
      forecast_days: 10,
      timezone: 'auto'
    };

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
    return response.data;
  } catch (error) {
    console.error('Weather API error - Status:', error.response?.status, 'Message:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
    return null;
  }
}

// Endpoint to get weather by location name
app.post('/api/weather/by-location', async (req, res) => {
  try {
    const { location } = req.body;
    console.log('Received location search request for:', location);

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const coordinates = await getCoordinates(location);
    if (!coordinates) {
      return res.status(404).json({ error: 'Location not found' });
    }

    console.log('Found coordinates:', coordinates);
    const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
    if (!weatherData) {
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }

    res.json({
      location: coordinates,
      weather: weatherData
    });
  } catch (error) {
    console.error('Error in location search:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get weather by coordinates
app.post('/api/weather/by-coordinates', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log('Weather by coordinates request:', latitude, longitude);

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weatherData = await getWeatherData(latitude, longitude);
    if (!weatherData) {
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }

    // Try to get location name via reverse geocoding
    console.log('Attempting reverse geocoding...');
    const locationData = await reverseGeocode(latitude, longitude);
    
    const locationInfo = locationData || {
      latitude,
      longitude,
      name: 'Current Location',
      address: null
    };

    console.log('Location info:', locationInfo);

    res.json({
      location: locationInfo,
      weather: weatherData
    });
  } catch (error) {
    console.error('Error in by-coordinates endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to reverse geocode (get location name from coordinates)
app.post('/api/geocode/reverse', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json'
      },
      headers: {
        'User-Agent': 'WeatherApp/1.0 (contact@example.com)'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get location suggestions
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Check cache first
    const cachedResults = getCachedSuggestions(q);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    console.log('Location suggestions for:', q);
    
    // Apply global throttle to respect Nominatim rate limits
    await throttleNominatimRequest();

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: q,
        format: 'json',
        limit: 5,
        countrycodes: 'in,us,gb,au,ca,de,fr' // Prioritize common countries
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 WeatherApp/1.0'
      },
      timeout: 10000
    });

    const suggestions = response.data.map(location => ({
      name: location.name,
      display_name: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    }));

    // Cache the results
    setCachedSuggestions(q, suggestions);

    console.log('Suggestions found:', suggestions.length);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error.message);
    
    // Return cached data if available even on error
    const cachedResults = suggestionsCache.get(req.query.q);
    if (cachedResults && cachedResults.data) {
      console.log('Returning expired cache due to error');
      return res.json(cachedResults.data);
    }
    
    res.json([]);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on port ${PORT}`);
});
