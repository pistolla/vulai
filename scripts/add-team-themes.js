const { initializeApp: initApp } = require('firebase/app');
const { getFirestore: getFS, collection: getCollection, getDocs: getAllDocs, doc: getDocRef, updateDoc: updateDocument } = require('firebase/firestore');

const firebaseConfigForThemes = {
  apiKey: "AIzaSyAfueNrXFi1MR5RwbLSYVOwAkW2IfiM9RI",
  authDomain: "unill-20c41.firebaseapp.com",
  projectId: "unill-20c41",
  storageBucket: "unill-20c41.firebasestorage.app",
  messagingSenderId: "775721930353",
  appId: "1:775721930353:web:c9a75b90494363bcee55d0",
  measurementId: "G-F7X1S54R7N"
};

const themeApp = initApp(firebaseConfigForThemes);
const themeDb = getFS(themeApp);

// Predefined theme color palettes for sports teams
const themePalettes = [
  { primary: '#990000', secondary: '#ffffff', accent: '#13294b' }, // Classic Red
  { primary: '#002868', secondary: '#ffffff', accent: '#bf0a30' }, // Navy Blue
  { primary: '#1a472a', secondary: '#ffffff', accent: '#f9a01b' }, // Forest Green
  { primary: '#5c2d91', secondary: '#ffffff', accent: '#ffc72c' }, // Purple Gold
  { primary: '#c8102e', secondary: '#ffffff', accent: '#000000' }, // Bright Red
  { primary: '#006bb6', secondary: '#ffffff', accent: '#ed174c' }, // Royal Blue
  { primary: '#ce1141', secondary: '#ffffff', accent: '#002b5c' }, // Crimson
  { primary: '#552583', secondary: '#ffffff', accent: '#fdb927' }, // Lakers Purple
  { primary: '#00471b', secondary: '#ffffff', accent: '#eee1c6' }, // Celtics Green
  { primary: '#e03a3e', secondary: '#ffffff', accent: '#006bb6' }, // Fire Red
  { primary: '#0f4c81', secondary: '#ffffff', accent: '#ff6b35' }, // Classic Blue
  { primary: '#2d6a4f', secondary: '#ffffff', accent: '#95d5b2' }, // Teal Green
  { primary: '#7b2cbf', secondary: '#ffffff', accent: '#ff6d00' }, // Vibrant Purple
  { primary: '#d62828', secondary: '#ffffff', accent: '#fcbf49' }, // Sunset Red
  { primary: '#1d3557', secondary: '#ffffff', accent: '#e63946' }, // Navy Crimson
];

// Get a random palette
function getRandomPalette() {
  return themePalettes[Math.floor(Math.random() * themePalettes.length)];
}

// Generate a random hex color
function generateRandomColor() {
  const letters = '0123456789abcdef';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Generate a completely random theme
function generateRandomTheme() {
  return {
    primary: generateRandomColor(),
    secondary: '#ffffff',
    accent: generateRandomColor()
  };
}

async function addThemesToTeams() {
  console.log('--- Adding Themes to Teams ---\n');

  try {
    const teamsRef = getCollection(themeDb, 'teams');
    const snapshot = await getAllDocs(teamsRef);

    if (snapshot.empty) {
      console.log('No teams found in the collection.');
      return;
    }

    console.log(`Found ${snapshot.size} teams.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const teamDoc of snapshot.docs) {
      const teamData = teamDoc.data();
      const teamId = teamDoc.id;
      const teamName = teamData.name || teamId;

      // Check if team already has a theme with primary color
      if (teamData.theme && teamData.theme.primary) {
        console.log(`⏭️  Skipping "${teamName}" - already has theme:`, teamData.theme);
        skippedCount++;
        continue;
      }

      // Get a random theme palette
      const theme = getRandomPalette();

      // Update the team document with the new theme
      await updateDocument(getDocRef(themeDb, 'teams', teamId), { theme });

      console.log(`✅ Updated "${teamName}" with theme:`, theme);
      updatedCount++;
    }

    console.log('\n--- Summary ---');
    console.log(`Total teams: ${snapshot.size}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already had theme): ${skippedCount}`);
    console.log('--- Complete ---');

  } catch (error) {
    console.error('Error adding themes to teams:', error);
  }
}

// Run the script
addThemesToTeams().catch(console.error);
