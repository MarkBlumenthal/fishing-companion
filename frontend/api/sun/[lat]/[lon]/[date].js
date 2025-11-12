const axios = require('axios');

module.exports = async (req, res) => {
  const { lat, lon, date } = req.query;

  try {
    const { data } = await axios.get(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`
    );

    const dateObj = new Date(date);
    const moonPhase = ((dateObj.getTime() / 86400000) % 29.5) / 29.5;

    res.status(200).json({
      sunrise: data.results.sunrise.split('T')[1].split('+')[0],
      sunset:  data.results.sunset.split('T')[1].split('+')[0],
      moonPhase
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sun data', details: err?.message || String(err) });
  }
};
