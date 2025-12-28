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
      const sport = 'americanfootball_nfl';
      const markets = 'player_pass_tds,player_pass_yds,player_rush_yds,player_receptions';
      
      // First, get list of games/events to find IDs
      const eventsUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${API_KEY}`;
      const eventsRes = await fetch(eventsUrl);
      const eventsData = await eventsRes.json();
      
      if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
        return res.json({
          success: true,
          data: {
            bookmakers: []
          }
        });
      }
      
      // Get props for the first available event
      const firstEvent = eventsData[0];
      const eventId = firstEvent.id;
      
      const propsUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds?apiKey=${API_KEY}&regions=us&markets=${markets}&oddsFormat=decimal`;
      
      const propsRes = await fetch(propsUrl);
      const propsData = await propsRes.json();
      
      // Extract bookmakers from the event
      const bookmakers = propsData.bookmakers || [];
      
      return res.json({
        success: true,
        data: {
          bookmakers: bookmakers
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(404).json({ error: 'Invalid action. Use action=games or action=props' });
}
