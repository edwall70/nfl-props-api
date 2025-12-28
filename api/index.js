const axios = require('axios');

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

async function getNFLGames() {
  try {
    const response = await axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/events`, {
      params: { apiKey: ODDS_API_KEY }
    });
    return response.data.events || [];
  } catch (error) {
    console.error('Error fetching games:', error.message);
    return [];
  }
}

async function getAllNFLProps() {
  try {
    const response = await axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/odds`, {
      params: {
        apiKey: ODDS_API_KEY,
        markets: 'player_pass_yds,player_pass_tds,player_rush_yds,player_rec_yds',
        oddsFormat: 'decimal',
        regions: 'us'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching props:', error.message);
    return { bookmakers: [] };
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    if (action === 'games') {
      const games = await getNFLGames();
      return res.status(200).json({ success: true, events: games });
    }

    if (action === 'props') {
      const props = await getAllNFLProps();
      return res.status(200).json({ success: true, data: props });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
