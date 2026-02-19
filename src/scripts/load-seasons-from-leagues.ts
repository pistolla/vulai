/**
 * Script to load seasons per sport using the league collection
 * 
 * This script will:
 * 1. Fetch all sports from Firestore
 * 2. Fetch all leagues from Firestore
 * 3. For each league, try to load seasons from leagues/{leagueId}/seasons
 * 4. Associate those seasons with the sport that the league belongs to (via sportId)
 * 5. Also try to load seasons from sports/{sportId}/seasons for comparison
 * 
 * Run with: npx tsx src/scripts/load-seasons-from-leagues.ts
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Firebase config from src/services/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual';
}

interface League {
  id: string;
  name: string;
  sportId?: string;
  sportName?: string;
  sportType?: string;
}

interface Season {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

interface LeagueSeason extends Season {
  _leagueId?: string;
  _leagueName?: string;
}

interface SportWithSeasons extends Sport {
  seasonsFromSports: Season[];
  seasonsFromLeagues: LeagueSeason[];
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadSeasonsFromLeagues(): Promise<void> {
  console.log('🏈 Loading seasons per sport from league collection...\n');

  // Step 1: Fetch all sports
  console.log('📋 Step 1: Fetching all sports...');
  const sportsSnap = await getDocs(collection(db, 'sports'));
  const sports: Sport[] = sportsSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as Sport));
  console.log(`   Found ${sports.length} sports`);
  
  // Create a map for quick lookup
  const sportMap = new Map<string, Sport>();
  sports.forEach(s => sportMap.set(s.id, s));

  // Step 2: Fetch all leagues
  console.log('\n📋 Step 2: Fetching all leagues...');
  const leaguesSnap = await getDocs(collection(db, 'leagues'));
  const leagues: League[] = leaguesSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  } as League));
  console.log(`   Found ${leagues.length} leagues`);

  // Step 3: For each sport, load seasons from both sports and leagues collections
  console.log('\n📋 Step 3: Loading seasons per sport...');
  
  const sportsWithSeasons: SportWithSeasons[] = [];

  for (const sport of sports) {
    console.log(`\n   Processing sport: ${sport.name} (${sport.id})`);
    
    // 3a: Load seasons from sports/{sportId}/seasons
    console.log(`      Loading from sports/${sport.id}/seasons...`);
    let seasonsFromSports: Season[] = [];
    try {
      const sportSeasonsSnap = await getDocs(collection(db, `sports/${sport.id}/seasons`));
      seasonsFromSports = sportSeasonsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Season));
      console.log(`      Found ${seasonsFromSports.length} seasons in sports collection`);
    } catch (error) {
      console.log(`      ⚠️  No seasons found in sports collection or error: ${error}`);
    }

    // 3b: Load seasons from leagues that belong to this sport
    console.log(`      Loading from leagues belonging to this sport...`);
    const sportLeagues = leagues.filter(l => l.sportId === sport.id);
    console.log(`      Found ${sportLeagues.length} leagues for this sport`);
    
    const seasonsFromLeagues: LeagueSeason[] = [];
    
    for (const league of sportLeagues) {
      try {
        const leagueSeasonsSnap = await getDocs(collection(db, `leagues/${league.id}/seasons`));
        const leagueSeasons = leagueSeasonsSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          _leagueId: league.id,
          _leagueName: league.name
        } as LeagueSeason));
        
        if (leagueSeasons.length > 0) {
          console.log(`         - League "${league.name}": ${leagueSeasons.length} seasons`);
          seasonsFromLeagues.push(...leagueSeasons);
        }
      } catch (error) {
        // Silently continue - some leagues might not have seasons subcollection
      }
    }
    
    console.log(`      Total seasons from leagues: ${seasonsFromLeagues.length}`);

    sportsWithSeasons.push({
      ...sport,
      seasonsFromSports,
      seasonsFromLeagues
    });
  }

  // Step 4: Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY: Seasons per Sport');
  console.log('='.repeat(60));

  for (const sport of sportsWithSeasons) {
    console.log(`\n🏅 ${sport.name} (${sport.category})`);
    console.log(`   Seasons from sports collection: ${sport.seasonsFromSports.length}`);
    console.log(`   Seasons from leagues collection: ${sport.seasonsFromLeagues.length}`);
    
    if (sport.seasonsFromSports.length > 0) {
      console.log('   Sports collection seasons:');
      sport.seasonsFromSports.forEach(s => {
        console.log(`      - ${s.name} (${s.id})`);
        if (s.isActive) console.log(`        Active: ✅`);
      });
    }
    
    if (sport.seasonsFromLeagues.length > 0) {
      console.log('   League collection seasons:');
      sport.seasonsFromLeagues.forEach(s => {
        console.log(`      - ${s.name} (${s.id}) from league: ${s._leagueName || 'unknown'}`);
      });
    }
  }

  // Step 5: Check for any orphaned seasons (in leagues without sportId)
  console.log('\n' + '='.repeat(60));
  console.log('📊 CHECKING: Leagues without sportId');
  console.log('='.repeat(60));
  
  const leaguesWithoutSportId = leagues.filter(l => !l.sportId);
  console.log(`\nFound ${leaguesWithoutSportId.length} leagues without sportId`);
  
  for (const league of leaguesWithoutSportId.slice(0, 10)) { // Show first 10
    console.log(`\n   League: ${league.name} (${league.id})`);
    console.log(`      sportType: ${league.sportType || 'not set'}`);
    
    // Check if this league has seasons
    try {
      const leagueSeasonsSnap = await getDocs(collection(db, `leagues/${league.id}/seasons`));
      const count = leagueSeasonsSnap.size;
      if (count > 0) {
        console.log(`      ⚠️  Has ${count} seasons but no sportId!`);
      }
    } catch (error) {
      // Ignore
    }
  }

  console.log('\n✅ Script completed!\n');
}

// Run the script
loadSeasonsFromLeagues().catch(console.error);
