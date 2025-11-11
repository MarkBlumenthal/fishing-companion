const axios = require('axios');

module.exports = async (req, res) => {
  const { lat, lon } = req.query;
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing OPENWEATHER_API_KEY' });

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
    const { data } = await axios.get(url);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forecast data', details: err?.message || String(err) });
  }
};
