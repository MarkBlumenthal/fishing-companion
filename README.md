# 🎣 Fishing Companion

A modern web app for anglers to **plan trips**, **log catches**, and get **live conditions**.  
Built with **React + TypeScript** on the frontend and **Vercel Serverless Functions** for backend endpoints.

## 🚀 Live Demo
**Frontend + API (Vercel):** https://fishing-companion.vercel.app/

---

## ✨ Features

- **Trip Planner:** create upcoming trips, view details, and track plans.
- **Catch Journal:** log species, weight/length, notes, photos, and location.
- **Dashboard:** quick glance at recent catches, upcoming trips, and weather.
- **Weather & Forecast:** current conditions + 5-day forecast via OpenWeather.
- **Sun & Moon:** sunrise/sunset and an approximate moon phase.
- **(Mock) Tides:** placeholder tide data so UI stays functional anywhere.
- **Map:** visualize catch/trip locations.
- **Responsive UI:** optimized for desktop and mobile.

---

## 🧰 Tech Stack

**Frontend**
- React (TypeScript), Vite/CRA (depending on your setup)
- CSS/Bootstrap for styling
- Redux slices/services for domain state (fish, trips, weather, journal)

**Backend (Serverless)**
- Vercel **API routes** under `/api`
  - `GET /api/weather/:lat/:lon`
  - `GET /api/forecast/:lat/:lon`
  - `GET /api/sun/:lat/:lon/:date`
  - `GET /api/tides/:lat/:lon/:date` (mock data)

**External APIs**
- [OpenWeather](https://openweathermap.org/api) — current weather & 5-day forecast
- [Sunrise-Sunset](https://sunrise-sunset.org/api) — sunrise/sunset (no key).  
  Moon phase is calculated locally (approximation).

---

## 📁 Project Structure (frontend)

frontend/
src/
App.tsx
index.tsx
components/
Dashboard/
Dashboard.tsx
Dashboard.css
RecentCatches.tsx
UpcomingTrips.tsx
WeatherOverview.tsx
TripPlanner/
TripPlanner.tsx
TripPlanner.css
TripForm.tsx
TripDetails.tsx
CatchJournal/
CatchJournal.tsx
CatchJournal.css
CatchForm.tsx
Weather/
WeatherForecast.tsx
Weather.css
FishDatabase.tsx
Map.tsx
(plus helpers, slices, services, types)
public/
index.html
api/
weather/[lat]/[lon].js
forecast/[lat]/[lon].js
sun/[lat]/[lon]/[date].js
tides/[lat]/[lon]/[date].js
package.json
tsconfig.json
(optional) vercel.json

pgsql
Copy code

> **Note:** The dynamic **[param]** filenames in `/api` mirror the URLs the app calls.  
> Example: `/api/weather/32.08/34.78` → `api/weather/[lat]/[lon].js`.

---

## 🔐 Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Name                 | Where used            | Notes                                                                  |
|----------------------|-----------------------|------------------------------------------------------------------------|
| `OPENWEATHER_API_KEY`| Serverless functions  | Required for `/api/weather` and `/api/forecast`                        |

> You **do not** need to expose this to the browser (no `REACT_APP_*` required) because API calls go through Vercel functions.

For local dev (optional), you can create `frontend/.env.local`:
OPENWEATHER_API_KEY=your_openweather_key_here

yaml
Copy code

---

## 🧑‍💻 Local Development

### Option A — CRA dev server + Vercel CLI (recommended)
1. Install deps:
   ```bash
   cd frontend
   npm install
Run Vercel dev (emulates serverless /api):

bash
Copy code
npx vercel dev
This starts both the frontend and API locally (you’ll see a localhost URL).
If you prefer two terminals, you can also run:

bash
Copy code
npm start        # React dev server
npx vercel dev   # in another terminal (for API)
Option B — Pure CRA
If you’re not using Vercel CLI, make sure your frontend’s API base URL points to the running local server (if you have a separate local backend). Otherwise, prefer Option A.

🧱 Build
bash
Copy code
cd frontend
npm run build
Outputs a production bundle to frontend/build/.

☁️ Deployment (Vercel)
Push your repo to GitHub.

In Vercel, Add New → Project → Import Git Repo.

Set Root Directory to frontend/.

Vercel will auto-detect Create React App (or your chosen preset):

Install: npm ci (auto)

Build: npm run build (auto)

Output: build (auto)

Add OPENWEATHER_API_KEY in Project Environment Variables (Production + Preview + Development).

Deploy. Every new push redeploys automatically:

non-main branches → Preview deployments

main branch → Production

Optional: If deep links 404, add frontend/vercel.json:

json
Copy code
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
🔗 API Endpoints
Current weather
GET /api/weather/:lat/:lon
Example: /api/weather/32.08/34.78

5-day forecast
GET /api/forecast/:lat/:lon
Example: /api/forecast/32.08/34.78

Sunrise/Sunset + Moon Phase
GET /api/sun/:lat/:lon/:date (date = YYYY-MM-DD)
Example: /api/sun/32.08/34.78/2025-11-12

Tides (mock)
GET /api/tides/:lat/:lon/:date
Example: /api/tides/32.08/34.78/2025-11-12

🧭 Roadmap
✅ Core journaling and trip planner

✅ Weather/forecast + sunrise/sunset

⏳ Real tide data provider integration

⏳ Auth + multi-user profiles

⏳ Photo upload to cloud storage

⏳ Advanced analytics (best spots/times/species)

🧪 Testing
Basic React tests can be added under src/*.test.tsx.
Run:

bash
Copy code
npm test
🛠 Troubleshooting
API returns 500 “Missing OPENWEATHER_API_KEY”
Ensure the exact var name is set in Vercel → Project → Environment Variables, then Redeploy the latest build.

Deep links 404 on refresh
Add the vercel.json rewrite (see Deployment section).

Chrome shows old CSS / layout
Hard-refresh (Ctrl/Cmd+Shift+R) or add a query string to your CSS link:
projects.css?v=YYYYMMDD.

🤝 Contributing
PRs welcome! Please:

Use descriptive commit messages

Keep components focused

Add types to new code paths

📜 License
MIT © Mark Blumenthal
