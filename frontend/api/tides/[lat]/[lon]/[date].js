// Friendly mock: inland → return empty array (200), not an error
module.exports = (req, res) => {
  const { lon } = req.query;
  const lonAbs = Math.abs(Number(lon));

  const isUSCoast = Math.abs(lonAbs - 123) < 3 || Math.abs(lonAbs - 74) < 3;
  const isMedCoast = lonAbs >= 33 && lonAbs <= 36;

  if (!isUSCoast && !isMedCoast) {
    return res.status(200).json([]); // inland → no tides
  }

  const tides = [
    { time: '03:42:00', height: 1.2, type: 'low' },
    { time: '09:56:00', height: 4.5, type: 'high' },
    { time: '16:12:00', height: 0.8, type: 'low' },
    { time: '22:24:00', height: 3.9, type: 'high' }
  ];

  res.status(200).json(tides);
};
