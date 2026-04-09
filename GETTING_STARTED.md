# Getting Started - Complete Setup Guide 🚀

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v14+) - Download from https://nodejs.org/
- **npm** (comes with Node.js)
- **A code editor** (VS Code recommended)
- **A web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (for APIs)

### Verify Installation

Open terminal/PowerShell and run:
```bash
node --version   # Should show v14.0.0 or higher
npm --version    # Should show 6.0.0 or higher
```

If not installed or versions are old, download Node.js from https://nodejs.org/

---

## Step-by-Step Setup

### Step 1: Open Project in VS Code

```bash
# Open VS Code
code c:\Users\sriwa\Desktop\weather_prediction
```

Or:
1. Open VS Code
2. File → Open Folder
3. Navigate to `c:\Users\sriwa\Desktop\weather_prediction`
4. Click Select Folder

### Step 2: Install Backend Dependencies

Open terminal in VS Code (Ctrl+`) and run:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install
```

**What it does:**
- Creates `node_modules` folder
- Installs: express, cors, axios, dotenv
- Creates `package-lock.json`

**You should see:**
```
added 123 packages, and audited 167 packages in 5s
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend (from root)
cd ../frontend

# Install dependencies
npm install
```

**What it does:**
- Creates `node_modules` folder
- Installs: react, react-dom, axios, react-scripts
- Creates `package-lock.json`

**You should see:**
```
added 1234 packages, and audited 1489 packages in 2m
```

This might take 1-2 minutes.

### Step 4: Install Root Dependencies (Optional but Recommended)

```bash
# Go back to root
cd ..

# Install concurrently to run both servers
npm install
```

This installs `concurrently` which lets you run both servers with one command.

---

## Running the Application

### Option A: Run Everything at Once (Easiest)

**Terminal in VS Code (Ctrl+`):**

```bash
# Make sure you're in the root folder
# c:\Users\sriwa\Desktop\weather_prediction

npm run dev
```

**What happens:**
- Terminal 1: Backend starts on http://localhost:5000
- Terminal 2: Frontend starts on http://localhost:3000
- Your browser opens automatically to http://localhost:3000

**You should see:**
```
> weather-prediction@1.0.0 dev
> concurrently "npm run server" "npm run client"

[0] backend: Weather API server running on port 5000
[1] frontend: Compiled successfully!
[1] frontend: Compiled successfully! You can now view weather-frontend in the browser.
```

### Option B: Run Separately (Recommended for Learning)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

You should see:
```
Weather API server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
# Open a new terminal (Ctrl+Shift+`)
cd frontend
npm start
```

You should see:
```
Compiled successfully!

You can now view weather-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Browser opens automatically. If not, open http://localhost:3000 manually.

---

## First Time Using the App

### 1. Allow Location Access
When you first open the app, your browser will ask:
```
weather forecast pro wants to access your location
```

Click **Allow** to use device location.

### 2. You Should See
- Your current location loaded automatically
- Current temperature and conditions
- Detailed weather metrics (humidity, wind, pressure, etc.)
- Hourly forecast for next 24 hours
- 10-day forecast grid

### 3. Try Searching
- Type "London" in the search box
- Click "Search" or press Enter
- Weather for London appears

### 4. Try Different Locations
- "Tokyo"
- "Sydney"
- "Paris"
- "Dubai"
- Any city in the world!

---

## What Each Terminal Shows

### Backend Terminal Output

```
Weather API server running on port 5000
```

When frontend makes a request:
```
GET /api/weather/by-coordinates
200 OK
```

If error:
```
Error: getaddrinfo ENOTFOUND api.open-meteo.com
```
This means internet connection issue.

### Frontend Terminal Output

```
Compiled successfully!

You can now view weather-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

While loading:
```
[HMR] waiting for update signal from WDS...
```

This is normal - means hot module reloading is ready.

---

## Stopping the App

Press **Ctrl+C** in terminal(s):

```
^C
Terminate batch job (Y/N)? Y
```

**If running with `npm run dev`:**
- Single Ctrl+C stops everything

**If running separately:**
- Ctrl+C in Backend Terminal → Backend stops
- Ctrl+C in Frontend Terminal → Frontend stops

---

## Testing the App Works

### Test Checklist

- [ ] App opens without errors
- [ ] Current location loads automatically
- [ ] Weather data displays (temperature, conditions)
- [ ] Can scroll hourly forecast left/right
- [ ] Can see 10-day forecast
- [ ] Can search for a city
- [ ] "Current Location" button works
- [ ] No red errors in browser console

### Browser Console (F12)

**Good:**
```
[HMR] connected
weater_prediction:1
```

**Bad:**
```
GET http://localhost:5000/api/weather/by-coordinates 404
```
This means backend isn't running.

---

## Common First-Time Issues

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
cd backend
npm install
```

### Issue: "npm: command not found"
**Solution:**
Node.js not installed. Download from https://nodejs.org/

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
cd frontend
PORT=3001 npm start
```

### Issue: "Geolocation not working"
**Solution:**
- Browser might not have permission
- Go to browser Settings → Privacy → Site Settings → Location
- Make sure localhost is allowed
- Some browsers need HTTPS (not needed for localhost)

### Issue: "Weather data not loading"
**Solution:**
1. Check internet connection
2. Open browser console (F12)
3. Check what error appears
4. Verify backend is running (`npm run server`)

### Issue: "Cannot GET /api/weather/..."
**Solution:**
Backend not running. Open new terminal and:
```bash
cd backend
npm start
```

---

## File Navigation Tips

In VS Code:

1. **View Terminal Output:**
   - Ctrl+` (backtick) = Open/Close terminal

2. **View File:**
   - Click file in Explorer panel on left to open

3. **Edit File:**
   - Click to open, then edit code
   - Save with Ctrl+S

4. **Find Something:**
   - Ctrl+F = Find in current file
   - Ctrl+Shift+F = Search entire project

---

## Next Steps After Getting Started

1. **Explore the Code:**
   - Open `frontend/src/App.js` to see main component
   - Open `backend/server.js` to see API endpoints
   - Read comments in code

2. **Read Documentation:**
   - Open `README.md` for complete documentation
   - Open `QUICKSTART.md` for quick reference
   - Open `ARCHITECTURE.md` to understand how it works

3. **Customize:**
   - Change colors in `frontend/src/App.css`
   - Change default location in `frontend/src/App.js`
   - Add more weather details from API

4. **Deploy:**
   - See `DEPLOYMENT.md` for hosting options
   - Free options: Vercel, Netlify

5. **Share:**
   - Deploy to public URL
   - Share with friends
   - Get feedback

---

## Need Help During Setup?

### Check These First:

1. **Are both servers running?**
   - Backend terminal shows: "Weather API server running on port 5000"
   - Frontend terminal shows: "Compiled successfully!"

2. **Is there a network error?**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try searching for a city
   - Look for red X marks (failed requests)

3. **Is internet working?**
   - Try opening https://google.com
   - Try opening https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0

4. **Are all dependencies installed?**
   - Check `backend/node_modules` folder exists
   - Check `frontend/node_modules` folder exists
   - If not, run `npm install` in those folders

5. **Is Node.js correct version?**
   ```bash
   node --version   # Should be 14.0.0+
   ```

### If Still Stuck:

1. Delete `node_modules` folders and reinstall:
   ```bash
   cd backend
   rm -r node_modules package-lock.json
   npm install
   ```

2. Check file structure matches `PROJECT_STRUCTURE.md`

3. Make sure all files from the setup were created

---

## Performance Tips

1. **First Load:** Might be slow due to node_modules size (normal)
2. **Subsequent Loads:** Much faster due to caching
3. **Hot Reload:** Changes to code auto-reload (hot module reloading)
4. **API Response:** Should be under 2 seconds for most locations

---

## Security Note

- **No API Keys Stored:** Open-Meteo and Nominatim don't need keys
- **No Database:** App doesn't store any user data
- **Localhost Only:** Currently only works on your machine
- **For Production:** See `DEPLOYMENT.md` for secure hosting

---

## Congratulations! 🎉

You now have a fully functional, professional weather app running locally!

**Next:** Try different features, customize colors, and read the architecture guide to understand how everything works.

---

**Questions?** See README.md or ARCHITECTURE.md for detailed information.

**Happy Weather Forecasting!** ☀️ 🌧️ ❄️
