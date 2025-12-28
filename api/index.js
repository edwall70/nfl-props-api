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
    console.error('Error:', error.message);
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
    console.error('Error:', error.message);
    return { bookmakers: [] };
  }
}

module.exports = async (req, res) => {
  const { action } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (action === 'games') {
      const games = await getNFLGames();
      return res.json({ events: games });
    }

    if (action === 'props') {
      const props = await getAllNFLProps();
      return res.json(props);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
