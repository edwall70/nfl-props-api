export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  if (!action) {
    res.status(400).json({ error: 'Missing action parameter' });
    return;
  }

  if (action === 'games') {
    res.status(200).json({
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
    return;
  }

  res.status(400).json({ error: `Unknown action: ${action}` });
}
