module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query || {};

  if (!action) {
    return res.status(400).json({ error: 'Missing action parameter' });
  }

  if (action === 'games') {
    return res.status(200).json({
      success: true,
      events: [
        {
          id: 'game1',
          home_team: 'Kansas City Chiefs',
          away_team: 'Pittsburgh Steelers',
          commence_time: '2025-12-28T18:00:00Z'
        },
        {
          id: 'game2',
          home_team: 'Buffalo Bills',
          away_team: 'Miami Dolphins',
          commence_time: '2025-12-28T21:25:00Z'
        }
      ]
    });
  }

  if (action === 'props') {
    return res.status(200).json({
      success: true,
      data: { bookmakers: [] }
    });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
};
