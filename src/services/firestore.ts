import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import {
  University,
  Team,
  Athlete,
  Fixture,
  News,
  Ticket,
} from '@/models';

/* ---------- generic helpers ---------- */
const col = <T = any>(c: string) => collection(db, c) as any;
const snapTo = <T>(snap: any): T[] => snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

/* ---------- role-based data loaders ---------- */
export const loadAdminData = async () => {
  try {
    console.log('Loading admin data...');
    const [uniSnap, teamSnap, fixSnap] = await Promise.all([
      getDocs(col<University>('universities')),
      getDocs(col<Team>('teams')),
      getDocs(query(col<Fixture>('fixtures'), orderBy('scheduledAt', 'desc'), limit(100))),
    ]);
    console.log(`Loaded admin data: ${uniSnap.docs.length} universities, ${teamSnap.docs.length} teams, ${fixSnap.docs.length} fixtures`);
    return {
      universities: snapTo<University>(uniSnap),
      teams: snapTo<Team>(teamSnap),
      fixtures: snapTo<Fixture>(fixSnap),
    };
  } catch (error) {
    console.error('Failed to load admin data:', error);
    throw error;
  }
};

export const loadCorrespondentData = async (uid: string) => {
  try {
    console.log(`Loading correspondent data for user: ${uid}`);
    const [pub, dra] = await Promise.all([
      getDocs(query(col<News>('news'), where('authorId', '==', uid), orderBy('publishedAt', 'desc'))),
      getDocs(query(col<News>('news_drafts'), where('authorId', '==', uid))),
    ]);
    console.log(`Loaded correspondent data: ${pub.docs.length} published articles, ${dra.docs.length} drafts`);
    return { myArticles: snapTo<News>(pub), draftArticles: snapTo<News>(dra) };
  } catch (error) {
    console.error('Failed to load correspondent data:', error);
    throw error;
  }
};

export const loadFanData = async (uid: string) => {
  try {
    console.log(`Loading fan data for user: ${uid}`);
    const [tickets, followed, feed] = await Promise.all([
      getDocs(query(col<Ticket>('tickets'), where('fanId', '==', uid))),
      getDoc(doc(db, 'fans', uid)).then((d) => (d.exists() ? d.data().followedTeams ?? [] : [])),
      getDocs(
        query(
          col<News>('news'),
          orderBy('publishedAt', 'desc'),
          limit(50)
        )
      ),
    ]);
    console.log(`Loaded fan data: ${tickets.docs.length} tickets, ${followed.length} followed teams, ${feed.docs.length} news items`);
    return {
      myTickets: snapTo<Ticket>(tickets),
      followedTeams: followed as string[],
      newsFeed: snapTo<News>(feed),
    };
  } catch (error) {
    console.error('Failed to load fan data:', error);
    throw error;
  }
};

export const loadSportTeamData = async (teamId: string) => {
  try {
    console.log(`Loading sport team data for team: ${teamId}`);
    const [teamSnap, athSnap, fixSnap] = await Promise.all([
      getDocs(query(col<Team>('teams'), where('__name__', '==', teamId))),
      getDocs(query(col<Athlete>('athletes'), where('teamId', '==', teamId))),
      getDocs(
        query(
          col<Fixture>('fixtures'),
          where('homeTeamId', '==', teamId),
          where('status', 'in', ['scheduled', 'live'])
        )
      ),
    ]);
    console.log(`Loaded sport team data: ${teamSnap.docs.length} teams, ${athSnap.docs.length} athletes, ${fixSnap.docs.length} fixtures`);
    return {
      myTeam: snapTo<Team>(teamSnap)[0] ?? null,
      athletes: snapTo<Athlete>(athSnap),
      fixtures: snapTo<Fixture>(fixSnap),
    };
  } catch (error) {
    console.error('Failed to load sport team data:', error);
    throw error;
  }
};
