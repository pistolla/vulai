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
  const [uniSnap, teamSnap, fixSnap] = await Promise.all([
    getDocs(col<University>('universities')),
    getDocs(col<Team>('teams')),
    getDocs(query(col<Fixture>('fixtures'), orderBy('scheduledAt', 'desc'), limit(100))),
  ]);
  return {
    universities: snapTo<University>(uniSnap),
    teams: snapTo<Team>(teamSnap),
    fixtures: snapTo<Fixture>(fixSnap),
  };
};

export const loadCorrespondentData = async (uid: string) => {
  const [pub, dra] = await Promise.all([
    getDocs(query(col<News>('news'), where('authorId', '==', uid), orderBy('publishedAt', 'desc'))),
    getDocs(query(col<News>('news_drafts'), where('authorId', '==', uid))),
  ]);
  return { myArticles: snapTo<News>(pub), draftArticles: snapTo<News>(dra) };
};

export const loadFanData = async (uid: string) => {
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
  return {
    myTickets: snapTo<Ticket>(tickets),
    followedTeams: followed as string[],
    newsFeed: snapTo<News>(feed),
  };
};

export const loadSportTeamData = async (teamId: string) => {
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
  return {
    myTeam: snapTo<Team>(teamSnap)[0] ?? null,
    athletes: snapTo<Athlete>(athSnap),
    fixtures: snapTo<Fixture>(fixSnap),
  };
};
