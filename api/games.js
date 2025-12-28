export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const action = req.query.action;
  const gameId = req.query.gameId;
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
      
      // Get the game info from ESPN to find team names
      let targetTeams = null;
      if (gameId) {
        const espnRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        const espnData = await espnRes.json();
        const game = espnData.events?.find(e => e.id === gameId);
        if (game && game.competitions && game.competitions[0]) {
          const homeTeam = game.competitions[0].competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
          const awayTeam = game.competitions[0].competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
          if (homeTeam && awayTeam) {
            targetTeams = { home: homeTeam, away: awayTeam };
          }
        }
      }
      
      // Get all NFL events from Odds API
      const eventsUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${API_KEY}`;
      const eventsRes = await fetch(eventsUrl);
      const eventsData = await eventsRes.json();
      
      if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
        return res.json({
          success: true,
          data: { bookmakers: [] }
        });
      }
      
      // Find matching event or use first one
      let targetEvent = eventsData[0];
      if (targetTeams) {
        const matchingEvent = eventsData.find(event => {
          const home = event.home_team;
          const away = event.away_team;
          return (home && away && 
                  ((home.includes(targetTeams.home.split(' ').pop()) || targetTeams.home.includes(home.split(' ').pop())) &&
                   (away.includes(targetTeams.away.split(' ').pop()) || targetTeams.away.includes(away.split(' ').pop()))));
        });
        if (matchingEvent) {
          targetEvent = matchingEvent;
        }
      }
      
      const eventId = targetEvent.id;
      
      // Fetch props for the event
      const propsUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds?apiKey=${API_KEY}&regions=us&markets=${markets}&oddsFormat=decimal`;
      const propsRes = await fetch(propsUrl);
      const propsData = await propsRes.json();
      
      const bookmakers = propsData.bookmakers || [];
      
      return res.json({
        success: true,
        data: {
          bookmakers: bookmakers,
          eventInfo: {
            home: targetEvent.home_team,
            away: targetEvent.away_team,
            commence_time: targetEvent.commence_time
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(404).json({ error: 'Invalid action. Use action=games or action=props' });
}
