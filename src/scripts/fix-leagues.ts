/**
 * Script to fix existing leagues that don't have sportName set
 * 
 * This script will:
 * 1. Fetch all leagues from Firestore
 * 2. Fetch all sports from Firestore
 * 3. For each league without sportName, try to match with a sport
 * 4. Update the league with the correct sportName and sportId
 * 
 * Run with: npx tsx src/scripts/fix-leagues.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual';
}

interface League {
  id: string;
  name: string;
  sportName?: string;
  sportId?: string;
  sportType?: string;
}

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
  sportName?: string;
  sportId?: string;
  sportType?: string;
}

async function fixLeagues() {
  console.log('🚀 Starting league fix script...\n');
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // 1. Fetch all sports
    console.log('📋 Fetching sports from Firestore...');
    const sportsSnap = await getDocs(collection(db, 'sports'));
    const sports: Sport[] = sportsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Sport));
    console.log(`   Found ${sports.length} sports\n`);
    
    // 2. Fetch all leagues
    console.log('📋 Fetching leagues from Firestore...');
    const leaguesSnap = await getDocs(collection(db, 'leagues'));
    const leagues: League[] = leaguesSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as League));
    console.log(`   Found ${leagues.length} leagues\n`);
    
    // 3. Find leagues that need fixing
    const leaguesNeedingFix = leagues.filter(l => !l.sportName);
    console.log(`⚠️  Leagues without sportName: ${leaguesNeedingFix.length}\n`);
    
    if (leaguesNeedingFix.length === 0) {
      console.log('✅ All leagues already have sportName set!');
      return;
    }
    
    // 4. Fix each league
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const league of leaguesNeedingFix) {
      console.log(`\n📝 Processing league: "${league.name}" (${league.id})`);
      console.log(`   Current sportType: ${league.sportType || 'undefined'}`);
      
      // Try multiple matching strategies
      let matchedSport: Sport | null = null;
      
      // Strategy 1: Match by league name (exact)
      matchedSport = sports.find(s => 
        s.name.toLowerCase() === league.name.toLowerCase()
      ) || null;
      
      // Strategy 2: Partial match on league name
      if (!matchedSport) {
        matchedSport = sports.find(s => 
          league.name.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(league.name.toLowerCase())
        ) || null;
      }
      
      // Strategy 3: Match by sportType (if it's 'team' or 'individual', try to find a team or individual sport)
      if (!matchedSport && league.sportType) {
        if (league.sportType.toLowerCase() === 'team') {
          // Try to find a team sport
          matchedSport = sports.find(s => s.category === 'team') || null;
        } else if (league.sportType.toLowerCase() === 'individual') {
          matchedSport = sports.find(s => s.category === 'individual') || null;
        }
      }
      
      if (matchedSport) {
        console.log(`   ✅ Matched with sport: "${matchedSport.name}" (${matchedSport.id})`);
        
        // Update the league
        await updateDoc(doc(db, 'leagues', league.id), {
          sportName: matchedSport.name,
          sportId: matchedSport.id,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`   ✅ Updated league with sportName and sportId`);
        fixedCount++;
      } else {
        console.log(`   ❌ Could not find matching sport`);
        skippedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   - Total leagues: ${leagues.length}`);
    console.log(`   - Leagues fixed: ${fixedCount}`);
    console.log(`   - Leagues skipped: ${skippedCount}`);
    console.log('='.repeat(50));
    
    if (fixedCount > 0) {
      console.log('\n✅ League fix script completed successfully!');
    } else {
      console.log('\n⚠️  No leagues could be fixed. Check your sports data.');
    }
    
  } catch (error) {
    console.error('\n❌ Error running league fix script:', error);
    throw error;
  }
}

// Run the script
fixLeagues()
  .then(() => {
    console.log('\n👋 Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
