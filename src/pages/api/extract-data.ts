import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface ExtractedData {
  vendorName: string;
  date: string;
  totalAmount: number;
  lineItems: { description: string; price: number }[];
}

// String templates for single branch of required JSON data
const templates: { [key: string]: string } = {
  'league': '{"id": "string", "name": "string", "sportType": "team", "description": "string", "createdAt": "string", "updatedAt": "string", "groups": [{"id": "string", "name": "string", "description": "string", "createdAt": "string", "stages": [{"id": "string", "name": "string", "order": number, "type": "round_robin", "createdAt": "string", "matches": [{"id": "string", "matchNumber": number, "date": "string", "venue": "string", "status": "pending", "participants": [{"refType": "team", "refId": "string", "name": "string", "score": number, "stats": {}}], "players": [{"id": "string", "name": "string", "teamId": "string", "teamName": "string", "position": "string", "entranceTime": "string", "jerseyNumber": number}], "winnerId": "string", "blogContent": "string", "createdAt": "string", "updatedAt": "string"}]}]}]}',
  'team data': '{"id": "string", "name": "string", "sport": "string", "coach": "string", "founded": "string", "league": "string", "record": "string", "championships": "string", "season": "string", "stats": {"played": number, "wins": number, "draws": number, "losses": number, "goals_for": number, "goals_against": number, "goal_difference": number, "points": number}, "players": [{"name": "string", "position": "string", "avatar": "string"}]}',
  'players data': '{"id": "string", "name": "string", "position": "string", "teamId": "string", "height": number, "weight": number, "bodyFat": number, "status": "string", "injuryNote": "string", "joinedAt": "string", "kitNumber": number, "avatar": "string", "bio": "string", "socialLinks": {"instagram": "string", "twitter": "string"}, "social": {"level": number, "xp": number, "nextLevelXp": number, "followers": "string", "badges": [{"id": "string", "name": "string", "icon": "string"}]}, "stats": {"gamesPlayed": number, "points": number}}',
  'match results': '{"id": number, "sport": "string", "homeTeam": "string", "awayTeam": "string", "date": "string", "time": "string", "venue": "string", "status": "string", "score": {"home": number, "away": number}}',
};

const generatePrompt = (dataType: string): string => {
  const key = dataType.toLowerCase() as keyof typeof templates;
  const template = templates[key];
  if (!template) {
    throw new Error(`Unknown data type: ${dataType}`);
  }

  const typeLabels: { [key: string]: string } = {
    'league': 'university',
    'team data': 'team',
    'players data': 'player',
    'match results': 'match',
  };

  const label = typeLabels[dataType.toLowerCase()] || 'data';

  return `Extract ${label} data from the document. Return a JSON array where each object has this structure: ${template}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, mimeType, dataType } = req.body;

    if (!base64Data || !mimeType || !dataType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = generatePrompt(dataType);

    // For now, load the sample data as mock extracted data
    // In production, send prompt and base64Data to LLM for extraction
    const sampleData = await loadSampleData(dataType);
    const mockData = sampleData;

    // TODO: Replace with actual LLM integration
    // const extractedData = await callLLM(prompt, base64Data, mimeType);

    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error extracting data:', error);
    res.status(500).json({ error: 'Failed to extract data' });
  }
}

const loadSampleData = async (dataType: string): Promise<any> => {
  switch (dataType.toLowerCase()) {
    case 'league':
      // Return mock League data
      return {
        leagues: [
          {
            id: "sample-league",
            name: "Sample University League",
            sportType: "team",
            description: "A sample league for demonstration",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            groups: [
              {
                id: "group1",
                name: "Group A",
                description: "First group",
                createdAt: new Date().toISOString(),
                stages: [
                  {
                    id: "stage1",
                    name: "Round Robin",
                    order: 1,
                    type: "round_robin",
                    createdAt: new Date().toISOString(),
                    matches: [
                      {
                        id: "match1",
                        matchNumber: 1,
                        date: new Date().toISOString(),
                        venue: "Stadium A",
                        status: "pending",
                        participants: [
                          { refType: "team", refId: "team1", name: "Team 1", score: 0 },
                          { refType: "team", refId: "team2", name: "Team 2", score: 0 }
                        ],
                        players: [],
                        winnerId: null,
                        blogContent: "",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
    case 'team data':
      const teamsPath = path.join(process.cwd(), 'public', 'data', 'teams.json');
      const teamsContent = fs.readFileSync(teamsPath, 'utf-8');
      return JSON.parse(teamsContent);
    case 'players data':
      const playersPath = path.join(process.cwd(), 'public', 'data', 'players.json');
      const playersContent = fs.readFileSync(playersPath, 'utf-8');
      return JSON.parse(playersContent);
    case 'match results':
      const schedulePath = path.join(process.cwd(), 'public', 'data', 'schedule.json');
      const scheduleContent = fs.readFileSync(schedulePath, 'utf-8');
      return JSON.parse(scheduleContent);
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
};

// Placeholder for Vertex AI integration
async function callVertexAI(base64Data: string, mimeType: string): Promise<ExtractedData> {
  // Implement Vertex AI call here
  // This would require proper authentication and API calls
  throw new Error('Not implemented');
}