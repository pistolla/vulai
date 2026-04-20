import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDocs, 
  QueryDocumentSnapshot, DocumentData, writeBatch 
} from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

const UNIVERSITIES = [
  { id: 'uon001', name: 'University of Nairobi', teamName: 'Mean Machine', teamSlug: 'mean-machine' },
  { id: 'ku002', name: 'Kenyatta University', teamName: 'KU Pirates', teamSlug: 'ku-pirates' },
  { id: 'strath006', name: 'Strathmore University', teamName: 'Strathmore Leos', teamSlug: 'strathmore-leos' },
  { id: 'jkuat005', name: 'Jomo Kenyatta University', teamName: 'JKUAT Lynx', teamSlug: 'jkuat-lynx' },
  { id: 'mku003', name: 'Mount Kenya University', teamName: 'MKU Titans', teamSlug: 'mku-titans' },
  { id: 'mmust004', name: 'Masinde Muliro University', teamName: 'MMUST Warriors', teamSlug: 'mmust-warriors' }
];

const SPORTS = [
  { id: 'soccer', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'athletics', name: 'Athletics' }
];

const SEASON_NAME = "2023/2024";

async function seedData() {
  console.log('🚀 Initializing VULAI Seeding Script...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Ensure Seasons exist for each sport
    console.log('\n📅 Creating Active Season for each sport...');
    for (const sport of SPORTS) {
        const seasonRef = doc(db, `sports/${sport.id}/seasons/current-season`);
        await setDoc(seasonRef, {
            name: SEASON_NAME,
            isActive: true,
            startDate: "2023-09-01",
            endDate: "2024-06-30"
        });
        console.log(`   ✅ Season "2023/2024" set for ${sport.name}`);
    }

    // 2. Clear previous seed fixtures (optional but good for clean leaderboard)
    // console.log('\n🧹 Clearing old seed fixtures...');
    
    // 3. Generate Fixtures
    console.log('\n⚽ Generating matches and narratives...');
    const matchNarratives = [
        "A historic clash where tactical discipline met raw athleticism. The midfield battle was intense from the opening whistle.",
        "Under the floodlights, the efficiency of the strikers made all the difference. A masterclass in clinical finishing.",
        "A stalemate for 80 minutes until a moment of pure genius from a substitute changed the destiny of the match.",
        "Defense was the name of the game today. Both universities showed why they are the iron walls of the league.",
        "High tempo, high stakes. The momentum shifted like a pendulum until the final decisive corner kick."
    ];

    for (const sport of SPORTS) {
        console.log(`   🏆 Seeding ${sport.name}...`);
        const uniStats: Record<string, any> = {};

        // Create 8 fixtures for each sport
        for (let i = 0; i < 8; i++) {
            const home = UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
            let away = UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
            while (away.id === home.id) {
                away = UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
            }

            const homeScore = sport.id === 'soccer' ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 30) + 60;
            const awayScore = sport.id === 'soccer' ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 30) + 60;

            const fixture = {
                sport: sport.id,
                status: 'completed',
                scheduledAt: new Date(Date.now() - (i * 86400000)).toISOString(),
                venue: 'Main Campus Stadium',
                type: 'league',
                seasonId: 'current-season',
                participants: [
                    { refId: home.id, name: home.name, score: homeScore, refType: 'team' },
                    { refId: away.id, name: away.name, score: awayScore, refType: 'team' }
                ],
                blogContent: `<p>${matchNarratives[Math.floor(Math.random() * matchNarratives.length)]}</p><p>Key performance indicators suggest a significant shift in the ${sport.name} power dynamics this season.</p>`,
                approved: true
            };

            await addDoc(collection(db, 'fixtures'), fixture);

            // Update local aggregation for the leaderboard
            [home, away].forEach((uni, idx) => {
                const score = idx === 0 ? homeScore : awayScore;
                const oppScore = idx === 0 ? awayScore : homeScore;

                if (!uniStats[uni.id]) {
                    uniStats[uni.id] = { 
                        id: uni.id, 
                        name: uni.name, 
                        teamName: (uni as any).teamName,
                        teamSlug: (uni as any).teamSlug,
                        wins: 0, 
                        losses: 0, 
                        draws: 0, 
                        points: 0, 
                        games: 0 
                    };
                }
                const stats = uniStats[uni.id];
                stats.games += 1;
                if (score > oppScore) { stats.wins += 1; stats.points += 3; }
                else if (score < oppScore) { stats.losses += 1; }
                else { stats.draws += 1; stats.points += 1; }
            });
        }

        // Calculate and Save Leaderboard
        const rankings = Object.values(uniStats)
            .map((s: any) => ({
                ...s,
                efficiency: (s.points / (s.games || 1)) * 10, // General efficiency index
                tacticalStats: [
                    Math.floor(Math.random() * 40) + 60, // Attack
                    Math.floor(Math.random() * 40) + 60, // Control
                    Math.floor(Math.random() * 40) + 60, // Discipline
                    Math.floor(Math.random() * 40) + 60, // Momentum
                    Math.floor(Math.random() * 40) + 60  // Team Efficiency
                ]
            }))
            .sort((a, b) => b.points - a.points || b.efficiency - a.efficiency);

        await setDoc(doc(db, 'leaderboards', sport.id), {
            sportId: sport.id,
            sportName: sport.name,
            lastUpdated: new Date().toISOString(),
            rankings
        });
        console.log(`      ✅ Leaderboard finalized for ${sport.name}`);
    }

    console.log('\n🎉 ALL CONTENT SEEDED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seedData().then(() => process.exit(0));
