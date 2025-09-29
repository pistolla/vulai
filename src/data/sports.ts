import { Sport, Team, Match } from '../types';

export const sportsData: Sport[] = [
  {
    id: 'football',
    name: 'Football',
    category: 'team',
    description: 'American football with 11-player teams competing in high-energy matches',
    image: '/resources/football.jpg',
    players: 11,
    season: 'Fall',
    positions: ['Quarterback', 'Running Back', 'Wide Receiver', 'Defensive Line', 'Linebacker', 'Defensive Back'],
    stats: { wins: 8, losses: 2, championships: 3 }
  },
  {
    id: 'basketball',
    name: 'Basketball',
    category: 'team',
    description: 'Fast-paced 5v5 basketball with dynamic offense and defense',
    image: '/resources/basketball.jpg',
    players: 5,
    season: 'Winter',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    stats: { wins: 15, losses: 5, championships: 2 }
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    category: 'team',
    description: '6v6 indoor volleyball with powerful spikes and strategic plays',
    image: '/resources/volleyball.jpg',
    players: 6,
    season: 'Fall',
    positions: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
    stats: { wins: 12, losses: 3, championships: 1 }
  },
  {
    id: 'rugby',
    name: 'Rugby',
    category: 'team',
    description: '15-player rugby union with intense physical competition',
    image: '/resources/rugby.jpg',
    players: 15,
    season: 'Spring',
    positions: ['Prop', 'Hooker', 'Lock', 'Flanker', 'Scrum-half', 'Fly-half', 'Centre', 'Wing'],
    stats: { wins: 6, losses: 4, championships: 1 }
  },
  {
    id: 'hockey',
    name: 'Field Hockey',
    category: 'team',
    description: '11-player field hockey with fast stick work and teamwork',
    image: '/resources/hockey.jpg',
    players: 11,
    season: 'Fall',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    stats: { wins: 9, losses: 3, championships: 2 }
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'individual',
    description: 'Singles and doubles badminton with precision and agility',
    image: '/resources/badminton.jpg',
    players: 1,
    season: 'Spring',
    positions: ['Singles Player', 'Doubles Partner'],
    stats: { wins: 18, losses: 7, championships: 4 }
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    category: 'individual',
    description: 'Fast-paced table tennis with quick reflexes and strategy',
    image: '/resources/table-tennis.jpg',
    players: 1,
    season: 'Winter',
    positions: ['Singles Player', 'Doubles Team'],
    stats: { wins: 22, losses: 5, championships: 5 }
  },
  {
    id: 'chess',
    name: 'Chess',
    category: 'individual',
    description: 'Strategic chess competitions testing mental prowess',
    image: '/resources/chess.jpg',
    players: 1,
    season: 'Year-round',
    positions: ['Competitor', 'Team Captain'],
    stats: { wins: 25, losses: 3, championships: 6 }
  },
  {
    id: 'athletics',
    name: 'Athletics',
    category: 'individual',
    description: 'Track and field events showcasing speed, strength, and endurance',
    image: '/resources/athletics.jpg',
    players: 1,
    season: 'Spring',
    positions: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower'],
    stats: { wins: 30, losses: 8, championships: 7 }
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: 'individual',
    description: 'Competitive swimming with multiple strokes and distances',
    image: '/resources/swimming.jpg',
    players: 1,
    season: 'Winter',
    positions: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'],
    stats: { wins: 28, losses: 6, championships: 8 }
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'individual',
    description: 'Singles and doubles tennis with powerful serves and volleys',
    image: '/resources/tennis.jpg',
    players: 1,
    season: 'Spring',
    positions: ['Singles Player', 'Doubles Partner'],
    stats: { wins: 16, losses: 4, championships: 3 }
  },
  {
    id: 'cricket',
    name: 'Cricket',
    category: 'team',
    description: '11-player cricket with batting, bowling, and fielding skills',
    image: '/resources/cricket.jpg',
    players: 11,
    season: 'Spring',
    positions: ['Batsman', 'Bowler', 'Wicketkeeper', 'All-rounder'],
    stats: { wins: 7, losses: 5, championships: 1 }
  }
];

export const teamData: Team[] = [
  {
    id: 'eagles',
    name: 'Eagles',
    sport: 'football',
    coach: 'Marcus Johnson',
    founded: 2018,
    league: 'University Division I',
    record: '8-2',
    championships: 3,
    players: [
      { name: 'Jake Morrison', position: 'Quarterback', year: 'Senior', number: 12, height: '6\'2"', weight: '210 lbs', avatar: 'JM' },
      { name: 'Marcus Johnson', position: 'Running Back', year: 'Junior', number: 23, height: '5\'11"', weight: '195 lbs', avatar: 'MJ' },
      { name: 'Tyler Chen', position: 'Wide Receiver', year: 'Sophomore', number: 88, height: '6\'1"', weight: '185 lbs', avatar: 'TC' },
      { name: 'David Rodriguez', position: 'Defensive Line', year: 'Senior', number: 55, height: '6\'4"', weight: '280 lbs', avatar: 'DR' },
      { name: 'Alex Thompson', position: 'Linebacker', year: 'Junior', number: 44, height: '6\'2"', weight: '225 lbs', avatar: 'AT' },
      { name: 'Ryan Park', position: 'Cornerback', year: 'Sophomore', number: 21, height: '5\'10"', weight: '175 lbs', avatar: 'RP' },
      { name: 'Chris Davis', position: 'Safety', year: 'Senior', number: 15, height: '6\'0"', weight: '190 lbs', avatar: 'CD' },
      { name: 'Michael Brown', position: 'Offensive Line', year: 'Junior', number: 77, height: '6\'5"', weight: '310 lbs', avatar: 'MB' }
    ]
  },
  {
    id: 'titans',
    name: 'Titans',
    sport: 'basketball',
    coach: 'Sarah Chen',
    founded: 2019,
    league: 'University Basketball League',
    record: '15-5',
    championships: 2,
    players: [
      { name: 'Ryan Park', position: 'Point Guard', year: 'Senior', number: 5, height: '6\'0"', weight: '170 lbs', avatar: 'RP' },
      { name: 'Jordan Blake', position: 'Shooting Guard', year: 'Junior', number: 23, height: '6\'3"', weight: '185 lbs', avatar: 'JB' },
      { name: 'Sam Wilson', position: 'Small Forward', year: 'Sophomore', number: 33, height: '6\'6"', weight: '200 lbs', avatar: 'SW' },
      { name: 'Chris Davis', position: 'Power Forward', year: 'Senior', number: 42, height: '6\'8"', weight: '220 lbs', avatar: 'CD' },
      { name: 'Michael Brown', position: 'Center', year: 'Junior', number: 50, height: '6\'11"', weight: '250 lbs', avatar: 'MB' },
      { name: 'Alex Thompson', position: 'Guard', year: 'Sophomore', number: 11, height: '6\'2"', weight: '180 lbs', avatar: 'AT' },
      { name: 'David Lee', position: 'Forward', year: 'Senior', number: 25, height: '6\'7"', weight: '210 lbs', avatar: 'DL' },
      { name: 'Kevin Chang', position: 'Guard', year: 'Junior', number: 3, height: '5\'11"', weight: '165 lbs', avatar: 'KC' }
    ]
  },
  {
    id: 'spikers',
    name: 'Spikers',
    sport: 'volleyball',
    coach: 'David Rodriguez',
    founded: 2020,
    league: 'University Volleyball Association',
    record: '12-3',
    championships: 1,
    players: [
      { name: 'Emma Wilson', position: 'Setter', year: 'Senior', number: 10, height: '5\'9"', weight: '140 lbs', avatar: 'EW' },
      { name: 'Sarah Chen', position: 'Outside Hitter', year: 'Junior', number: 15, height: '6\'0"', weight: '155 lbs', avatar: 'SC' },
      { name: 'Lisa Rodriguez', position: 'Middle Blocker', year: 'Sophomore', number: 8, height: '6\'2"', weight: '160 lbs', avatar: 'LR' },
      { name: 'Jessica Park', position: 'Opposite Hitter', year: 'Senior', number: 12, height: '5\'11"', weight: '150 lbs', avatar: 'JP' },
      { name: 'Amanda Davis', position: 'Libero', year: 'Junior', number: 5, height: '5\'6"', weight: '130 lbs', avatar: 'AD' },
      { name: 'Rachel Kim', position: 'Outside Hitter', year: 'Sophomore', number: 18, height: '5\'10"', weight: '145 lbs', avatar: 'RK' },
      { name: 'Megan Thompson', position: 'Middle Blocker', year: 'Senior', number: 7, height: '6\'1"', weight: '158 lbs', avatar: 'MT' },
      { name: 'Nicole Brown', position: 'Defensive Specialist', year: 'Junior', number: 3, height: '5\'7"', weight: '135 lbs', avatar: 'NB' }
    ]
  }
];

export const matchData: Match[] = [
  {
    id: 1,
    sport: 'football',
    homeTeam: 'Eagles',
    awayTeam: 'Lions',
    date: '2025-10-15',
    time: '19:00',
    venue: 'University Stadium',
    status: 'upcoming',
    score: undefined
  },
  {
    id: 2,
    sport: 'basketball',
    homeTeam: 'Titans',
    awayTeam: 'Warriors',
    date: '2025-10-12',
    time: '20:00',
    venue: 'Sports Arena',
    status: 'live',
    score: { home: 67, away: 64 }
  },
  {
    id: 3,
    sport: 'volleyball',
    homeTeam: 'Spikers',
    awayTeam: 'Hawks',
    date: '2025-10-10',
    time: '18:30',
    venue: 'Gymnasium',
    status: 'completed',
    score: { home: 3, away: 1 }
  }
];
