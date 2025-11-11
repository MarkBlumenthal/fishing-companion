import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import Splash from './components/splash/Splash';
import Dashboard from './components/dashboard/Dashboard';
import TripPlanner from './components/trips/TripPlanner';
import TripForm from './components/trips/TripForm';
import TripDetails from './components/trips/TripDetails';
import FishDatabase from './components/fish/FishDatabase';
import CatchJournal from './components/journal/CatchJournal';
import CatchForm from './components/journal/CatchForm';
import WeatherForecast from './components/weather/WeatherForecast';
import CornerPop from './components/common/CornerPop';
import BubbleBackground from './components/common/BubbleBackground';
import cornerFish from './assets/corner-fish.png';


const App: React.FC = () => {
  return (
    <Router>
      {/* Bubbles render once at the app root so they appear on Splash and all pages */}
      <BubbleBackground count={12} />

      <Routes>
        {/* Splash Screen - First screen on load */}
        <Route path="/" element={<Splash />} />

        {/* Main App Routes with Header/Footer */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
};

// Layout with header and footer (mobile hamburger added)
const AppLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="App">
      <header className={`App-header ${isMenuOpen ? 'menu-open' : ''}`}>
        {/* Mobile hamburger toggle (CSS controls visibility by breakpoint) */}
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen(v => !v)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <h1>Fishing Companion</h1>

        <nav>
          <ul id="primary-navigation" className="nav-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/trips">Trip Planner</Link></li>
            <li><Link to="/fish">Fish Database</Link></li>
            <li><Link to="/journal">Catch Journal</Link></li>
            <li><Link to="/weather">Weather</Link></li>
          </ul>
        </nav>
      </header>

      <main className="App-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Trip routes */}
          <Route path="/trips" element={<TripPlanner />} />
          <Route path="/trips/new" element={<TripForm />} />
          <Route path="/trips/edit/:id" element={<TripForm isEdit={true} />} />
          <Route path="/trips/:id" element={<TripDetails />} />

          {/* Fish database route */}
          <Route path="/fish" element={<FishDatabase />} />

          {/* Journal routes */}
          <Route path="/journal" element={<CatchJournal />} />
          <Route path="/journal/new" element={<CatchForm />} />
          <Route path="/journal/edit/:id" element={<CatchForm isEdit={true} />} />

          {/* Weather forecast route */}
          <Route path="/weather" element={<WeatherForecast />} />

          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Sticky corner image */}
      <CornerPop imgSrc={cornerFish} size={220} />

      <footer className="App-footer">
  <p>&copy; {new Date().getFullYear()} Fishing Companion</p>
  <div className="social-links">
    <span>Follow us:</span>

    <a
      href="https://facebook.com/yourpage"
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
      aria-label="Facebook"
      title="Facebook"
    >
      <i className="fab fa-facebook"></i>
    </a>

    <a
      href="https://x.com/yourhandle"
      target="_blank"
      rel="noopener noreferrer"
      className="social-link x-logo"
      aria-label="X (Twitter)"
      title="X (Twitter)"
    >
      𝕏
    </a>
  </div>
</footer>

    </div>
  );
};

export default App;
