const axios = require('axios');

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Sample games for testing
const SAMPLE_GAMES = [
  {
    id: 'nfl_kc_pit',
    home_team: 'Kansas City Chiefs',
    away_team: 'Pittsburgh Steelers',
    commence_time: '2025-12-28T18:00Z'
  },
  {
    id: 'nfl_buf_mia',
    home_team: 'Buffalo Bills',
    away_team: 'Miami Dolphins',
    commence_time: '2025-12-28T20:30Z'
  }
];

async function getNFLGames() {
  try {
    console.log('Attempting to fetch games with key:', ODDS_API_KEY ? 'KEY_SET' : 'NO_KEY');
    const response = await axios.get(`${ODDS_API_BASE}/sports/americanfootball_nfl/events`, {
      params: { apiKey: ODDS_API_KEY },
      timeout: 10000
    });
    console.log('Got response:', response.data);
    const games = response.data.events || [];
    console.log(`Found ${games.length} games`);
    
    return games.length > 0 ? games : SAMPLE_GAMES;
  } catch (error) {
    console.error('Error fetching games:', error.message, error.response?.status);
    return SAMPLE_GAMES;
  }
}

