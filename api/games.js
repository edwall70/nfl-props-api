export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const action = req.query.action;
  const API_KEY = process.env.ODDS_API_KEY || '001933cab2f071ff99421cb5c3696a88';

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
    try {
      // Fetch player props from The Odds API
      const sport = 'americanfootball_nfl';
      const markets = 'player_pass_tds,player_pass_yds,player_rush_yds,player_receptions';
      
      const propsUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${API_KEY}&markets=${markets}&oddsFormat=decimal`;
      
      const propsRes = await fetch(propsUrl);
      const propsData = await propsRes.json();
      
      if (!propsData || propsData.length === 0) {
        return res.json({
          success: true,
          data: {
            bookmakers: []
          }
        });
      }
      
      // Transform the data to match the expected format
      // For now, return the first event's bookmakers
      const firstEvent = propsData[0];
      
      return res.json({
        success: true,
        data: {
          bookmakers: firstEvent.bookmakers || []
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(404).json({ error: 'Invalid action. Use action=games or action=props' });
}
