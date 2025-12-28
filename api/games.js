export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  
  if (req.query.action !== 'games') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    const gamesRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const gamesData = await gamesRes.json();
    const events = gamesData.events || [];
    
    return res.json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
