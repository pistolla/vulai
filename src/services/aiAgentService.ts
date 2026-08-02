import { GoogleGenAI, Type, FunctionDeclaration, Content, Part } from '@google/genai';
import * as admin from 'firebase-admin';

// ============================================================================
// FIREBASE ADMIN INITIALISATION (server-side only)
// ============================================================================

function getAdminFirestore(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    try {
      if (
        process.env.FIREBASE_PRIVATE_KEY &&
        !process.env.FIREBASE_PRIVATE_KEY.includes('Your_Private_Key')
      ) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        admin.initializeApp();
      }
    } catch (error: any) {
      console.error('Firebase admin init error:', error.message);
      if (!admin.apps.length) admin.initializeApp();
    }
  }
  return admin.firestore();
}

// ============================================================================
// TOOL DECLARATIONS — what the AI Agent is allowed to call
// ============================================================================

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'get_live_games',
    description:
      'Fetch the latest live games currently happening. Returns an array of game objects with teams, scores, sport type, and status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Max number of games to fetch (1–10)',
        },
      },
    },
  },
  {
    name: 'get_upcoming_games',
    description:
      'Fetch scheduled upcoming games. Returns an array of upcoming game objects with teams, scheduled date/time, and sport type.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Max number of games to fetch (1–10)',
        },
      },
    },
  },
  {
    name: 'get_top_teams',
    description:
      'Fetch teams from the database. Returns team name, sport, university, wins, losses, and logo.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Max number of teams to fetch (1–10)',
        },
      },
    },
  },
  {
    name: 'get_merchandise',
    description:
      'Fetch merchandise items. Returns item name, price, stock, image URL and description.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Max number of items to fetch (1–10)',
        },
      },
    },
  },
  {
    name: 'get_universities',
    description:
      'Fetch university records. Returns university name, logo, motto, and number of teams.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.INTEGER,
          description: 'Max number of universities to fetch (1–10)',
        },
      },
    },
  },
];

// ============================================================================
// TOOL EXECUTOR — runs the actual Firebase queries
// ============================================================================

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  db: admin.firestore.Firestore,
): Promise<unknown> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  switch (name) {
    case 'get_live_games': {
      const snap = await db
        .collection('admin')
        .doc('dashboard')
        .collection('liveGames')
        .limit(limit)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    case 'get_upcoming_games': {
      const snap = await db
        .collection('admin')
        .doc('dashboard')
        .collection('upcomingGames')
        .limit(limit)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    case 'get_top_teams': {
      const snap = await db.collection('teams').limit(limit).get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    case 'get_merchandise': {
      const snap = await db.collection('merchandise').limit(limit).get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    case 'get_universities': {
      const snap = await db.collection('universities').limit(limit).get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const AGENT_SYSTEM_INSTRUCTION = `
You are the content engine for a university sports social timeline in Kenya (Unill Sports).
Your goal is to generate exactly 6 highly engaging timeline cards.

STEP 1: Use the tools provided to query the database. Start by calling get_live_games, get_upcoming_games, and get_top_teams. If you need more data, also call get_merchandise and get_universities.
STEP 2: Based on the data returned by the tools, generate 6 timeline cards. Use ONLY the data returned by the tools. Do NOT invent scores, teams, or statistics. If a collection is empty, improvise the card type (e.g. fan_challenge or university_pride) but still ground it in any available data.

OUTPUT FORMAT:
Return a raw JSON array. Each object must have exactly these keys:
- "type": one of ["live_match", "upcoming_match", "leaderboard", "university_pride", "fan_challenge", "merch_drop"]
- "title": Short engaging title with an emoji (e.g., "🔴 Strathmore vs UoN")
- "subtitle": Brief context (e.g., "Live Score: 2 - 1")
- "body": 1-2 energetic sentences. Use emojis.
- "emoji": A single prominent emoji representing the card.
- "gradient": An array of two hex color codes (e.g. ["#dc2626", "#991b1b"]) matching the team or vibe.
- "ctaLabel": Short button text (e.g., "Watch Now")
- "ctaHref": Action URL (e.g., "/live-match/123", "/schedule", "/teams")
- "xpReward": Integer between 5 and 20.
- "priority": Integer. Live matches should be > 90. Upcoming > 80. Others 50-70.
- "metadata": Any relevant IDs or raw data from the source (e.g., {"fixtureId": "123", "home": "X", "away": "Y"}).
`;

// ============================================================================
// AGENT SERVICE
// ============================================================================

export class AIAgentService {
  /**
   * Runs the autonomous Agent loop:
   *   1. Send the system prompt + tools to Gemini
   *   2. If Gemini replies with functionCall parts → execute them, feed results back
   *   3. Repeat until Gemini replies with text (the final JSON array of cards)
   */
  async runTimelineAgent(): Promise<any[]> {
    console.log('[AIAgentService] Starting autonomous timeline generation loop…');

    const db = getAdminFirestore();
    const ai = new GoogleGenAI({});

    // Conversation history for the multi-turn agent loop
    const history: Content[] = [
      {
        role: 'user',
        parts: [
          {
            text: 'Generate 6 engaging timeline cards. Use your tools to explore the database first.',
          },
        ],
      },
    ];

    const MAX_ITERATIONS = 8; // safety guard

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      console.log(`[AIAgentService] Iteration ${i + 1}`);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: AGENT_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          temperature: 0.7,
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        console.warn('[AIAgentService] No parts in response, breaking.');
        break;
      }

      const responseParts: Part[] = candidate.content.parts;

      // ── Check for function calls ──────────────────────────────────
      const fnCalls = responseParts.filter((p) => p.functionCall);

      if (fnCalls.length > 0) {
        // Add the model's reply (containing the function call requests) to history
        history.push({ role: 'model', parts: responseParts });

        // Execute each tool and build function-response parts
        const fnResponseParts: Part[] = [];
        for (const part of fnCalls) {
          const call = part.functionCall!;
          const toolName = call.name ?? 'unknown';
          console.log(
            `[AIAgentService] → Tool call: ${toolName}(${JSON.stringify(call.args)})`,
          );

          let result: unknown;
          try {
            result = await executeTool(
              toolName,
              (call.args as Record<string, unknown>) || {},
              db,
            );
          } catch (err: any) {
            result = { error: err.message };
            console.error('[AIAgentService] Tool error:', err);
          }

          fnResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { result },
            },
          });
        }

        // Feed the tool results back to the model
        history.push({ role: 'user', parts: fnResponseParts });
        continue; // next iteration — model will process results
      }

      // ── No function calls → model returned its final text ─────────
      const textContent = responseParts
        .filter((p) => p.text)
        .map((p) => p.text)
        .join('');

      if (textContent) {
        console.log('[AIAgentService] Agent returned text output.');
        try {
          const cleaned = textContent
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          const parsedCards = JSON.parse(cleaned);
          if (Array.isArray(parsedCards) && parsedCards.length > 0) {
            return parsedCards.map((c: any) => ({
              ...c,
              reactions: { fire: 0, clap: 0, heart: 0, wow: 0, trophy: 0 },
            }));
          }
        } catch (parseErr) {
          console.error(
            '[AIAgentService] Failed to parse AI output:',
            parseErr,
          );
        }
      }

      break; // safety: unexpected response shape
    }

    throw new Error(
      'AI Agent failed to return valid JSON cards after multiple iterations.',
    );
  }
}

export const aiAgentService = new AIAgentService();
