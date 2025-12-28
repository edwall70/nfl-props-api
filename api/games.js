export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const action = req.query.action;

  if (action === 'games') {
    try {
      const gamesRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
      const gamesData = await gamesRes.json();
      const events = gamesData.events || [];
      
      return res.json({ success: true, events });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (action === 'props') {
    // TODO: Implement props fetching from a sportsbook API
    // For now, return mock data structure
    try {
      return res.json({
        success: true,
        data: {
          bookmakers: [
            {
              title: 'Sample Sportsbook',
              markets: [
                {
                  key: 'player_pass_yds',
                  outcomes: [
                    { description: 'Sample Player', price: 1.91 }
                  ]
                }
              ]
            }
          ]
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(404).json({ error: 'Invalid action. Use action=games or action=props' });
}
