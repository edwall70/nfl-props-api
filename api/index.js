const axios = require('axios');

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Cache for games
let cachedGames = [];
let cachedProps = {};

async function fetchAndCacheGames() {
  try {
    const response = await axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/events`, {
      params: { apiKey: ODDS_API_KEY }
    });
    cachedGames = response.data.events || [];
    console.log(`Cached ${cachedGames.length} games`);
    return cachedGames;
  } catch (error) {
    console.error('Error fetching games:', error.message);
    return cachedGames;
  }
}

async function fetchAndCacheProps() {
  try {
    const response = await axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/odds`, {
      params: {
        apiKey: ODDS_API_KEY,
        markets: 'player_pass_yds,player_pass_tds,player_rush_yds,player_rec_yds,player_rec_rec',
        oddsFormat: 'decimal',
        regions: 'us'
      }
    });
    cachedProps = response.data || { bookmakers: [] };
    console.log(`Cached props from ${cachedProps.bookmakers?.length || 0} bookmakers`);
    return cachedProps;
  } catch (error) {
    console.error('Error fetching props:', error.message);
    return cachedProps;
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // Fetch fresh games
    if (action === 'games') {
      const games = await fetchAndCacheGames();
      return res.status(200).json({ 
        success: true, 
        events: games.map(g => ({
          id: g.id,
          home_team: g.home_team,
          away_team: g.away_team,
          commence_time: g.commence_time
        }))
      });
    }

    // Fetch fresh props
    if (action === 'props') {
      const props = await fetchAndCacheProps();
      return res.status(200).json({ success: true, data: props });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
